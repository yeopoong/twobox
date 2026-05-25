// frontend/src/components/OrderCart.tsx
import React from 'react';

export interface SelectedOption {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  uniqueKey: string;
  id: number;
  name: string;
  price: number; // base price + selected options price
  quantity: number;
  selectedOptions: SelectedOption[];
  totalPrice: number;
}

interface OrderCartProps {
  items: CartItem[];
  onUpdateQuantity: (uniqueKey: string, change: number) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}

export const OrderCart: React.FC<OrderCartProps> = ({
  items,
  onUpdateQuantity,
  onClearCart,
  onCheckout,
}) => {
  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <aside className="cart-panel">
      <div className="cart-header">
        <div className="cart-header-title">
          <span>🛒</span>
          <span>장바구니</span>
          {totalCount > 0 && <span className="cart-count">{totalCount}</span>}
        </div>
        {items.length > 0 && (
          <button className="cart-clear-btn" onClick={onClearCart}>
            전체 비우기
          </button>
        )}
      </div>

      <div className="cart-items-container">
        {items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🍟</div>
            <p style={{ fontSize: '15px', fontWeight: 600 }}>장바구니가 비어 있습니다.</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              왼쪽 메뉴에서 음식을 선택해 주세요.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.uniqueKey} className="cart-item">
              <div className="cart-item-header">
                <div>
                  <h4 className="cart-item-name">{item.name}</h4>
                  {item.selectedOptions.length > 0 && (
                    <div className="cart-item-options">
                      {item.selectedOptions.map((opt) => (
                        <span key={opt.id} className="cart-item-option-badge">
                          +{opt.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="cart-item-footer">
                <span className="cart-item-price">
                  {item.totalPrice.toLocaleString()}원
                </span>
                
                <div className="quantity-control">
                  <button
                    className="qty-btn"
                    onClick={() => onUpdateQuantity(item.uniqueKey, -1)}
                  >
                    -
                  </button>
                  <span className="qty-number">{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => onUpdateQuantity(item.uniqueKey, 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="cart-footer">
        <div className="cart-summary-row">
          <span>총 주문 금액</span>
          <span className="cart-summary-total">
            {totalAmount.toLocaleString()}원
          </span>
        </div>
        <button
          className="checkout-btn"
          disabled={items.length === 0}
          onClick={onCheckout}
          style={{ opacity: items.length === 0 ? 0.6 : 1, cursor: items.length === 0 ? 'not-allowed' : 'pointer' }}
        >
          <span>주문하기</span>
          <span>➔</span>
        </button>
      </div>
    </aside>
  );
};
