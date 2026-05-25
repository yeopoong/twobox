# backend/app/main.py
import uuid
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict

from app.models import Category, MenuItem, OrderCreate, OrderResponse
from app.data import CATEGORIES, MENU_ITEMS, ORDERS, ORDER_COUNTER

app = FastAPI(
    title="Food Ordering Kiosk API",
    description="음식 주문 키오스크를 위한 백엔드 API 서버",
    version="1.0.0"
)

# CORS 미들웨어 추가 (프론트엔드 Vite 포트 대응)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 실 배포 시 특정 도메인으로 제한 가능
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Kiosk API Server is running."}

@app.get("/api/categories", response_model=List[Category], tags=["Menu"])
def get_categories():
    return CATEGORIES

@app.get("/api/menu", response_model=List[MenuItem], tags=["Menu"])
def get_menu(category: str = None):
    if category:
        filtered_menu = [item for item in MENU_ITEMS if item["category"] == category]
        return filtered_menu
    return MENU_ITEMS

@app.get("/api/menu/{item_id}", response_model=MenuItem, tags=["Menu"])
def get_menu_item(item_id: int):
    for item in MENU_ITEMS:
        if item["id"] == item_id:
            return item
    raise HTTPException(status_code=404, detail="메뉴를 찾을 수 없습니다.")

@app.post("/api/orders", response_model=OrderResponse, tags=["Orders"])
def create_order(order_data: OrderCreate):
    global ORDER_COUNTER
    
    # 간단한 유효성 검사
    if not order_data.items:
        raise HTTPException(status_code=400, detail="장바구니에 아이템이 없습니다.")
    
    # 고유 ID 및 대기번호 생성
    order_id = str(uuid.uuid4())
    order_number = ORDER_COUNTER
    ORDER_COUNTER += 1
    
    # 999 이후에는 다시 100번으로 리셋
    if ORDER_COUNTER > 999:
        ORDER_COUNTER = 100
        
    created_at_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    new_order = OrderResponse(
        order_id=order_id,
        order_number=order_number,
        items=order_data.items,
        total_amount=order_data.total_amount,
        eat_in=order_data.eat_in,
        payment_method=order_data.payment_method,
        status="PREPARING",  # PREPARING -> READY -> COMPLETED
        created_at=created_at_str
    )
    
    # 데이터 리스트에 저장
    ORDERS.append(new_order.model_dump())
    return new_order

@app.get("/api/orders/{order_id}", response_model=OrderResponse, tags=["Orders"])
def get_order(order_id: str):
    for order in ORDERS:
        if order["order_id"] == order_id:
            return order
    raise HTTPException(status_code=404, detail="주문 내역을 찾을 수 없습니다.")

@app.get("/api/orders", response_model=List[OrderResponse], tags=["Orders"])
def get_all_orders():
    return ORDERS

# 주문 상태 변경 API (관리자/주방 대시보드용으로 유용)
@app.patch("/api/orders/{order_id}/status", response_model=OrderResponse, tags=["Orders"])
def update_order_status(order_id: str, status: str):
    if status not in ["PREPARING", "READY", "COMPLETED"]:
        raise HTTPException(status_code=400, detail="올바르지 않은 주문 상태입니다. (PREPARING, READY, COMPLETED 중 하나여야 합니다.)")
        
    for order in ORDERS:
        if order["order_id"] == order_id:
            order["status"] = status
            return order
            
    raise HTTPException(status_code=404, detail="주문 내역을 찾을 수 없습니다.")
