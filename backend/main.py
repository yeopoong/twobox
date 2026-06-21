from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, String, Integer, DateTime
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from pydantic import BaseModel
import uuid
import datetime
from typing import Dict, List

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

Base.metadata.create_all(bind=engine)

# FastAPI App
app = FastAPI(title="Kiosk Review API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev only. Allow tablet and mobile origins in prod.
    allow_credentials=True,
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
