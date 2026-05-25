// frontend/src/components/WelcomeScreen.tsx
import React from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="welcome-container" onClick={onStart}>
      <div className="welcome-bg-glow" style={{ top: '20%', left: '20%' }}></div>
      <div className="welcome-bg-glow" style={{ bottom: '20%', right: '20%' }}></div>
      
      <div style={{ zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="welcome-logo">🍔</div>
        <h1 className="welcome-title">PREMIUM BURGER KITCHEN</h1>
        <h2 className="welcome-subtitle">수제 버거 & 디저트 키오스크</h2>
        
        <div className="welcome-touch-hint">
          <span>👇</span>
          <span>주문하시려면 화면을 터치를 하세요</span>
        </div>
      </div>
    </div>
  );
};
