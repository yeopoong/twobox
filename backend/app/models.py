# backend/app/models.py
from pydantic import BaseModel
from typing import List, Optional

class Option(BaseModel):
    id: str
    name: str
    price: int
    type: str

class MenuItem(BaseModel):
    id: int
    name: str
    english_name: str
    category: str
    price: int
    calories: int
    description: str
    image_url: str
    options: List[Option]

class Category(BaseModel):
    id: str
    name: str
    icon: str

class SelectedOption(BaseModel):
    id: str
    name: str
    price: int

class CartItem(BaseModel):
    id: int  # Menu Item ID
    name: str
    price: int
    quantity: int
    selected_options: List[SelectedOption]
    total_price: int

class OrderCreate(BaseModel):
    items: List[CartItem]
    total_amount: int
    eat_in: bool
    payment_method: str

class OrderResponse(BaseModel):
    order_id: str
    order_number: int
    items: List[CartItem]
    total_amount: int
    eat_in: bool
    payment_method: str
    status: str  # "PREPARING", "READY", "COMPLETED"
    created_at: str
