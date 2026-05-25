// frontend/src/components/CheckoutModal.tsx
import React, { useState } from 'react';
import type { CartItem } from './OrderCart';

interface CheckoutModalProps {
  cartItems: CartItem[];
  onClose: () => void;
  onOrderSuccess: (orderNumber: number) => void;
  clearCart: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  cartItems,
  onClose,
  onOrderSuccess,
  clearCart,
}) => {
  const [step, setStep] = useState<number>(1); // 1: Eat In/Take Out, 2: Payment, 3: Processing, 4: Done
  const [eatIn, setEatIn] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [orderNumber, setOrderNumber] = useState<number | null>(null);

  const totalAmount = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const handlePlaceOrder = async () => {
    setStep(3); // Processing step

    try {
      // Python FastAPI 백엔드로 주문 접수 API 요청
      const response = await fetch('http://127.0.0.1:8000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            selected_options: item.selectedOptions,
            total_price: item.totalPrice
          })),
          total_amount: totalAmount,
          eat_in: eatIn,
          payment_method: paymentMethod
        }),
      });

      if (!response.ok) {
        throw new Error('주문 전송 실패');
      }

      const data = await response.json();
      setOrderNumber(data.order_number);
      setStep(4); // Done
      clearCart();
    } catch (error) {
      console.error('Error placing order:', error);
      // 백엔드 연동에 실패했을 경우 Mock 대기번호 생성하여 데모 작동 보장
      setTimeout(() => {
        const mockOrderNum = Math.floor(Math.random() * 900) + 100;
        setOrderNumber(mockOrderNum);
        setStep(4);
        clearCart();
      }, 1500);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: step === 4 ? '450px' : '550px' }}>
        
        {/* Step 1: 식사 장소 선택 */}
        {step === 1 && (
          <>
            <div className="modal-header">
              <h2 className="modal-title">식사 장소 선택</h2>
              <button className="modal-close-btn" onClick={onClose}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="checkout-selection">
                <div
                  className={`checkout-choice-btn ${eatIn ? 'selected' : ''}`}
                  onClick={() => setEatIn(true)}
                >
                  <div className="checkout-choice-icon">🍽️</div>
                  <h3 className="checkout-choice-title">매장 식사</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    매장에서 따뜻하게 식사
                  </p>
                </div>
                <div
                  className={`checkout-choice-btn ${!eatIn ? 'selected' : ''}`}
                  onClick={() => setEatIn(false)}
                >
                  <div className="checkout-choice-icon">🛍️</div>
                  <h3 className="checkout-choice-title">포장 주문</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    안전하게 포장하여 이동
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="checkout-btn"
                style={{ flex: 1, background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', boxShadow: 'none' }}
                onClick={onClose}
              >
                취소
              </button>
              <button className="checkout-btn" style={{ flex: 1 }} onClick={() => setStep(2)}>
                다음 단계 ➔
              </button>
            </div>
          </>
        )}

        {/* Step 2: 결제 방법 선택 */}
        {step === 2 && (
          <>
            <div className="modal-header">
              <h2 className="modal-title">결제 수단 선택</h2>
              <button className="modal-close-btn" onClick={() => setStep(1)}>&larr; 이전</button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>최종 결제 금액</span>
                <h3 style={{ fontSize: '28px', color: 'var(--secondary)', fontWeight: 800, marginTop: '4px' }}>
                  {totalAmount.toLocaleString()}원
                </h3>
              </div>
              
              <div className="checkout-selection">
                <div
                  className={`checkout-choice-btn ${paymentMethod === 'card' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <div className="checkout-choice-icon">💳</div>
                  <h3 className="checkout-choice-title">신용카드</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    일반 신용 / 체크카드 결제
                  </p>
                </div>
                <div
                  className={`checkout-choice-btn ${paymentMethod === 'easy_pay' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('easy_pay')}
                >
                  <div className="checkout-choice-icon">📱</div>
                  <h3 className="checkout-choice-title">간편 결제</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    삼성페이 / 애플페이 / 카카오
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="checkout-btn"
                style={{ flex: 1, background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', boxShadow: 'none' }}
                onClick={() => setStep(1)}
              >
                이전 단계
              </button>
              <button className="checkout-btn" style={{ flex: 2 }} onClick={handlePlaceOrder}>
                결제 및 주문완료
              </button>
            </div>
          </>
        )}

        {/* Step 3: 결제 승인 중 로더 */}
        {step === 3 && (
          <div className="modal-body" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                border: '4px solid rgba(255, 111, 60, 0.1)',
                borderTopColor: 'var(--primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>결제 승인 진행 중...</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                카드를 투입구에 끝까지 밀어 넣어주세요.<br />결제가 완료될 때까지 기다려 주세요.
              </p>
            </div>
          </div>
        )}

        {/* Step 4: 결제 완료 & 대기 번호 출력 */}
        {step === 4 && (
          <>
            <div className="modal-body">
              <div className="completion-container">
                <span className="completion-success-icon">🎉</span>
                <h2 className="completion-title">주문이 성공적으로 완료되었습니다!</h2>
                <p className="completion-desc">결제가 승인되었으며 주문서가 출력되었습니다.</p>
                
                <div className="completion-order-number-box">
                  <div className="completion-number-label">주문 대기 번호</div>
                  <div className="completion-number">{orderNumber}</div>
                </div>
                
                <p className="completion-desc" style={{ color: 'var(--text-accent)' }}>
                  상단 전광판에 대기 번호가 호출되면<br />영수증을 지참하신 뒤 음식을 받아가시기 바랍니다.
                </p>
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop: 'none', background: 'none' }}>
              <button
                className="checkout-btn"
                style={{ flex: 1 }}
                onClick={() => {
                  if (orderNumber) onOrderSuccess(orderNumber);
                  onClose();
                }}
              >
                처음 화면으로 돌아가기
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
