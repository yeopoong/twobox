from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, String, Integer, DateTime, Boolean
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from pydantic import BaseModel
import uuid
import datetime
import random
import string
from typing import Dict, List
import resend
import os
from dotenv import load_dotenv

load_dotenv()

# Database Setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./kiosk.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class ReviewSessionModel(Base):
    __tablename__ = "review_sessions"
    id = Column(String, primary_key=True, index=True)
    status = Column(String, default="pending") # pending, copied, completed
    rating = Column(Integer, nullable=True)
    review_text = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class CouponModel(Base):
    __tablename__ = "coupons"
    id = Column(String, primary_key=True, index=True) # e.g. 6-digit code
    email = Column(String)
    prize = Column(String)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    used_at = Column(DateTime, nullable=True)

Base.metadata.create_all(bind=engine)

# FastAPI App
app = FastAPI(title="Kiosk Review API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic Schemas
class SessionCreate(BaseModel):
    rating: int
    review_text: str

class SessionResponse(BaseModel):
    id: str
    status: str
    rating: int
    review_text: str

class CouponRequest(BaseModel):
    email: str
    prize: str
    lang: str = "ko"

class CouponResponse(BaseModel):
    id: str
    email: str
    prize: str
    is_used: bool
    created_at: datetime.datetime
    used_at: datetime.datetime | None = None

# Connection Manager for WebSockets
class ConnectionManager:
    def __init__(self):
        # Maps session_id to a list of connected websockets
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = []
        self.active_connections[session_id].append(websocket)

    def disconnect(self, websocket: WebSocket, session_id: str):
        if session_id in self.active_connections:
            self.active_connections[session_id].remove(websocket)
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]

    async def broadcast_to_session(self, session_id: str, message: dict):
        if session_id in self.active_connections:
            for connection in self.active_connections[session_id]:
                await connection.send_json(message)

manager = ConnectionManager()

# REST Endpoints
@app.post("/sessions", response_model=SessionResponse)
def create_session(session_data: SessionCreate, db: Session = Depends(get_db)):
    session_id = str(uuid.uuid4())
    db_session = ReviewSessionModel(
        id=session_id,
        rating=session_data.rating,
        review_text=session_data.review_text,
        status="pending"
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

@app.get("/sessions/{session_id}", response_model=SessionResponse)
def get_session(session_id: str, db: Session = Depends(get_db)):
    db_session = db.query(ReviewSessionModel).filter(ReviewSessionModel.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
    return db_session

@app.post("/sessions/{session_id}/complete")
async def complete_session(session_id: str, db: Session = Depends(get_db)):
    db_session = db.query(ReviewSessionModel).filter(ReviewSessionModel.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    db_session.status = "completed"
    db.commit()
    
    # Notify connected tablet
    await manager.broadcast_to_session(session_id, {"type": "SESSION_COMPLETED", "session_id": session_id})
    return {"message": "Session completed successfully"}

@app.post("/send-coupon")
async def send_coupon_email(req: CouponRequest, db: Session = Depends(get_db)):
    resend_api_key = os.getenv("RESEND_API_KEY")
    
    # Generate 4-digit sequential code (0000, 0001, ...)
    coupon_count = db.query(CouponModel).count()
    coupon_code = f"{coupon_count:04d}"
    
    db_coupon = CouponModel(
        id=coupon_code,
        email=req.email,
        prize=req.prize
    )
    db.add(db_coupon)
    db.commit()
    
    if not resend_api_key:
        print(f"[MOCK EMAIL] To: {req.email}, Prize: {req.prize}, Code: {coupon_code}")
        return {"message": "Mock email sent (Resend API Key not configured)"}
        
    try:
        resend.api_key = resend_api_key
        
        # Simple i18n
        subject = "Your Twobox Chicken Coupon!"
        body_title = "Congratulations!"
        body_desc = f"You won: {req.prize}"
        
        if req.lang == 'ko':
            subject = "Twobox Chicken 당첨 쿠폰이 도착했습니다!"
            body_title = "축하합니다!"
            body_desc = f"당첨 상품: {req.prize}\n매장 카운터에서 이 이메일을 보여주세요."
        elif req.lang == 'es':
            subject = "¡Tu cupón de Twobox Chicken!"
            body_title = "¡Felicidades!"
            body_desc = f"Has ganado: {req.prize}\nMuestre este correo en el mostrador."
        else:
            body_desc += "\nPlease show this email at the counter."

        html_content = f"""
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f8fafc;">
            <div style="background-color: white; border: 2px dashed #e51b23; padding: 30px; border-radius: 10px; max-width: 400px; margin: 0 auto;">
              <h1 style="color: #2774ae; margin-bottom: 5px;">TWOBOX CHICKEN</h1>
              <h2 style="color: #e51b23; margin-top: 0;">{body_title}</h2>
              <p style="font-size: 20px; font-weight: bold; background: #facc15; padding: 15px; border-radius: 8px;">{req.prize}</p>
              
              <div style="margin: 30px 0; padding: 20px; border: 2px solid #2774ae; border-radius: 8px; background: #f0f7ff;">
                  <p style="margin: 0; color: #475569; font-size: 14px;">Coupon Code</p>
                  <p style="margin: 5px 0 0 0; font-size: 32px; font-weight: 900; letter-spacing: 5px; color: #0f172a;">{coupon_code}</p>
              </div>
              
              <p style="color: #475569; margin-top: 20px; white-space: pre-line;">{body_desc}</p>
            </div>
          </body>
        </html>
        """
        
        params: resend.Emails.SendParams = {
            "from": "Twobox Chicken <onboarding@resend.dev>",
            "to": [req.email],
            "subject": subject,
            "html": html_content,
        }
        
        email_response = resend.Emails.send(params)
        print(f"Resend sent: {email_response}")
        
        return {"message": "Email sent successfully", "coupon_code": coupon_code}
    except Exception as e:
        print(f"Resend Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to send email")

@app.get("/coupons/{code}", response_model=CouponResponse)
def verify_coupon(code: str, db: Session = Depends(get_db)):
    coupon = db.query(CouponModel).filter(CouponModel.id == code.upper()).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid coupon code")
    return coupon

@app.post("/coupons/{code}/use")
def use_coupon(code: str, db: Session = Depends(get_db)):
    coupon = db.query(CouponModel).filter(CouponModel.id == code.upper()).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid coupon code")
    if coupon.is_used:
        raise HTTPException(status_code=400, detail="Coupon already used")
        
    coupon.is_used = True
    coupon.used_at = datetime.datetime.utcnow()
    db.commit()
    return {"message": "Coupon successfully used", "prize": coupon.prize}

# WebSocket Endpoint
@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect(websocket, session_id)
    try:
        while True:
            # We can listen for messages from the client if needed
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)
