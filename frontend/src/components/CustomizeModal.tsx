// frontend/src/components/CustomizeModal.tsx
import React, { useState, useEffect } from 'react';
import type { MenuItem, Option } from './MenuItemCard';

interface SelectedOption {
  id: string;
  name: string;
  price: number;
}

interface CustomizeModalProps {
  item: MenuItem;
  onClose: () => void;
  onAddToCart: (item: MenuItem, selectedOptions: SelectedOption[]) => void;
}

export const CustomizeModal: React.FC<CustomizeModalProps> = ({
  item,
  onClose,
  onAddToCart,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(item.price);

  // 초기 로드 시 기본 choice/size 옵션 하나를 자동 선택해줍니다. (e.g. 일반 콜라, 컵 등)
  useEffect(() => {
    const defaultOptions: SelectedOption[] = [];
    
    // 일반 콜라(regular), 컵(cup) 등 기본 선택 옵션 설정
    const choices = item.options.filter(opt => opt.type === 'choice');
    if (choices.length > 0) {
      // 첫 번째 choice를 기본 선택으로 등록
      defaultOptions.push({
        id: choices[0].id,
        name: choices[0].name,
        price: choices[0].price,
      });
    }

    setSelectedOptions(defaultOptions);
  }, [item]);

  // 옵션 선택 시 가격 변경 감지
  useEffect(() => {
    const optionsPrice = selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
    setTotalPrice(item.price + optionsPrice);
  }, [selectedOptions, item]);

  const handleOptionToggle = (option: Option) => {
    const isSelected = selectedOptions.some(opt => opt.id === option.id);
    
    if (option.type === 'choice' || option.type === 'size') {
      // choice 나 size 타입은 단일 선택(exclusive)이어야 함
      // 같은 타입의 다른 옵션을 먼저 걸러내고 새 옵션 추가
      const otherOptionsOfSameType = item.options.filter(
        opt => opt.type === option.type && opt.id !== option.id
      );
      
      const filtered = selectedOptions.filter(
        opt => !otherOptionsOfSameType.some(o => o.id === opt.id)
      );

      if (isSelected) {
        // 이미 선택된 거라면, choice는 빈 값으로 둘 수 없으므로 무시하거나, size는 취소 가능
        if (option.type === 'size') {
          setSelectedOptions(filtered.filter(opt => opt.id !== option.id));
        }
      } else {
        setSelectedOptions([...filtered, { id: option.id, name: option.name, price: option.price }]);
      }
    } else {
      // addon 타입은 중복(다중) 선택 가능
      if (isSelected) {
        setSelectedOptions(selectedOptions.filter(opt => opt.id !== option.id));
      } else {
        setSelectedOptions([...selectedOptions, { id: option.id, name: option.name, price: option.price }]);
      }
    }
  };

  const handleAddClick = () => {
    onAddToCart(item, selectedOptions);
  };

  // 옵션 타입에 따른 한글 라벨
  const getGroupTitle = (type: string) => {
    switch (type) {
      case 'addon': return '추가 토핑 옵션';
      case 'size': return '사이즈 선택';
      case 'choice': return '맛 / 타입 선택';
      default: return '기타 옵션';
    }
  };

  // 타입별로 옵션을 그룹화
  const groupedOptions = item.options.reduce((acc, opt) => {
    if (!acc[opt.type]) acc[opt.type] = [];
    acc[opt.type].push(opt);
    return acc;
  }, {} as Record<string, Option[]>);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">옵션 선택</h2>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="custom-item-intro">
            <img src={item.image_url} alt={item.name} className="custom-item-img" />
            <div className="custom-item-details">
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{item.name}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {item.description}
              </p>
              <div className="custom-item-price">{item.price.toLocaleString()}원</div>
            </div>
          </div>

          {item.options.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px 0' }}>
              이 메뉴는 추가 옵션이 없습니다. 바로 장바구니에 담을 수 있습니다.
            </p>
          ) : (
            Object.entries(groupedOptions).map(([type, options]) => (
              <div key={type} className="option-group">
                <h4 className="option-group-title">{getGroupTitle(type)}</h4>
                <div className="options-list">
                  {options.map((option) => {
                    const isSelected = selectedOptions.some(opt => opt.id === option.id);
                    return (
                      <div
                        key={option.id}
                        className={`option-pill ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleOptionToggle(option)}
                      >
                        <div className="option-pill-left">
                          <div className="checkbox-custom"></div>
                          <span className="option-name">{option.name}</span>
                        </div>
                        <span className="option-price">
                          {option.price > 0 ? `+${option.price.toLocaleString()}원` : '추가 금액 없음'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="modal-footer">
          <button
            className="checkout-btn"
            style={{ flex: 1, background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', boxShadow: 'none' }}
            onClick={onClose}
          >
            취소
          </button>
          <button className="checkout-btn" style={{ flex: 2 }} onClick={handleAddClick}>
            <span>장바구니 담기</span>
            <span>({totalPrice.toLocaleString()}원)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
