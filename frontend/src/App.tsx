import { useState, useEffect } from 'react';
import './styles/index.css';

import { WelcomeScreen } from './components/WelcomeScreen';
import { CategoryNav } from './components/CategoryNav';
import { MenuItemCard } from './components/MenuItemCard';
import type { MenuItem } from './components/MenuItemCard';
import { OrderCart } from './components/OrderCart';
import type { CartItem, SelectedOption } from './components/OrderCart';
import { CustomizeModal } from './components/CustomizeModal';
import { CheckoutModal } from './components/CheckoutModal';

interface Category {
  id: string;
  name: string;
  icon: string;
}

// 백엔드가 꺼져있을 경우를 대비한 로컬 폴백 데이터
const FALLBACK_CATEGORIES: Category[] = [
  { id: 'burgers', name: '버거', icon: '🍔' },
  { id: 'sides', name: '사이드', icon: '🍟' },
  { id: 'drinks', name: '음료', icon: '🥤' },
  { id: 'desserts', name: '디저트', icon: '🍦' },
];

const FALLBACK_MENU: MenuItem[] = [
  {
    id: 1,
    name: '시그니처 비프 버거',
    english_name: 'Signature Beef Burger',
    category: 'burgers',
    price: 8500,
    calories: 650,
    description: '100% 순쇠고기 패티와 신선한 야채, 특제 비법 소스가 조화를 이루는 프리미엄 시그니처 버거',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    options: [
      { id: 'cheese', name: '체다치즈 추가', price: 500, type: 'addon' },
      { id: 'patty', name: '쇠고기 패티 추가', price: 2000, type: 'addon' },
      { id: 'bacon', name: '베이컨 추가', price: 1000, type: 'addon' },
    ]
  },
  {
    id: 2,
    name: '트러플 머쉬룸 버거',
    english_name: 'Truffle Mushroom Burger',
    category: 'burgers',
    price: 9500,
    calories: 710,
    description: '풍부한 향의 트러플 크림 소스와 쫄깃한 그릴 버섯이 촉촉한 패티와 어우러진 버거',
    image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
    options: [
      { id: 'cheese', name: '체다치즈 추가', price: 500, type: 'addon' },
      { id: 'patty', name: '쇠고기 패티 추가', price: 2000, type: 'addon' },
    ]
  },
  {
    id: 5,
    name: '골든 크리스피 감자튀김',
    english_name: 'French Fries',
    category: 'sides',
    price: 2500,
    calories: 320,
    description: '겉은 바삭하고 속은 촉촉하게 갓 튀겨낸 고소한 감자튀김',
    image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
    options: [
      { id: 'size_large', name: 'L 사이즈 업', price: 800, type: 'size' },
      { id: 'sauce_cheese', name: '치즈 소스 추가', price: 500, type: 'addon' },
    ]
  },
  {
    id: 8,
    name: '코카콜라 / 제로콜라',
    english_name: 'Coca Cola / Zero',
    category: 'drinks',
    price: 2000,
    calories: 140,
    description: '기름진 입맛을 깔끔하게 잡아줄 톡 쏘는 청량감의 탄산음료',
    image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
    options: [
      { id: 'regular', name: '일반 코카콜라', price: 0, type: 'choice' },
      { id: 'zero', name: '제로 코카콜라', price: 0, type: 'choice' },
      { id: 'size_large', name: 'L 사이즈 업', price: 500, type: 'size' },
    ]
  }
];

function App() {
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState<string>('burgers');
  const [menuItems, setMenuItems] = useState<MenuItem[]>(FALLBACK_MENU);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [showCheckout, setShowCheckout] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // 실시간 키오스크 시계 기능
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // FastAPI 백엔드 연동
  useEffect(() => {
    const fetchData = async () => {
      const apiBase = import.meta.env.DEV ? 'http://127.0.0.1:8000' : '';
      try {
        const catRes = await fetch(`${apiBase}/api/categories`);
        const menuRes = await fetch(`${apiBase}/api/menu`);
        
        if (catRes.ok && menuRes.ok) {
          const catData = await catRes.json();
          const menuData = await menuRes.json();
          setCategories(catData);
          setMenuItems(menuData);
          if (catData.length > 0) {
            setActiveCategory(catData[0].id);
          }
        }
      } catch (error) {
        console.warn('FastAPI 백엔드 연결에 실패하여 로컬 모의 데이터를 적용합니다.', error);
      }
    };
    fetchData();
  }, []);

  const handleStartOrder = () => {
    setShowWelcome(false);
    setCartItems([]);
  };

  const handleMenuItemClick = (item: MenuItem) => {
    // 옵션이 존재할 경우 커스텀 모달 오픈, 없을 경우 바로 1개 장바구니에 담기
    if (item.options && item.options.length > 0) {
      setCustomizingItem(item);
    } else {
      handleAddToCart(item, []);
    }
  };

  const handleAddToCart = (item: MenuItem, selectedOptions: SelectedOption[]) => {
    // 장바구니에 담을 고유 키 생성 (아이템 ID + 정렬된 옵션 ID들의 조합)
    const optionsKey = selectedOptions
      .map(o => o.id)
      .sort()
      .join('-');
    const uniqueKey = optionsKey ? `${item.id}-${optionsKey}` : `${item.id}`;

    // 옵션 가격 포함된 단가 계산
    const optionsTotal = selectedOptions.reduce((sum, o) => sum + o.price, 0);
    const itemPriceWithSelectedOptions = item.price + optionsTotal;

    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(i => i.uniqueKey === uniqueKey);

      if (existingItemIndex > -1) {
        // 이미 동일 옵션 상품이 존재하면 수량 1 증가
        const updated = [...prevItems];
        const currentItem = updated[existingItemIndex];
        const newQty = currentItem.quantity + 1;
        updated[existingItemIndex] = {
          ...currentItem,
          quantity: newQty,
          totalPrice: currentItem.price * newQty,
        };
        return updated;
      } else {
        // 존재하지 않으면 신규 추가
        const newItem: CartItem = {
          uniqueKey,
          id: item.id,
          name: item.name,
          price: itemPriceWithSelectedOptions,
          quantity: 1,
          selectedOptions,
          totalPrice: itemPriceWithSelectedOptions,
        };
        return [...prevItems, newItem];
      }
    });

    setCustomizingItem(null); // 모달 닫기
  };

  const handleUpdateQuantity = (uniqueKey: string, change: number) => {
    setCartItems((prevItems) => {
      return prevItems
        .map((item) => {
          if (item.uniqueKey === uniqueKey) {
            const nextQty = item.quantity + change;
            if (nextQty <= 0) return null; // 수량이 0 이하면 목록에서 제거
            return {
              ...item,
              quantity: nextQty,
              totalPrice: item.price * nextQty,
            };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleCheckoutClose = () => {
    setShowCheckout(false);
  };

  const handleOrderSuccess = (_orderNumber: number) => {
    // 결제 완료 후 대기 번호를 받은 뒤 처음 화면으로 초기화
    setShowWelcome(true);
    setCartItems([]);
  };

  // 현재 활성화된 카테고리의 상품만 보기
  const filteredMenuItems = menuItems.filter(item => item.category === activeCategory);

  if (showWelcome) {
    return <WelcomeScreen onStart={handleStartOrder} />;
  }

  return (
    <div className="kiosk-container">
      {/* Kiosk Top Header */}
      <header className="kiosk-header">
        <div className="kiosk-logo" onClick={() => setShowWelcome(true)}>
          <span>🍔</span>
          <span>PREMIUM KITCHEN</span>
        </div>
        <div className="kiosk-header-right">
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-accent)' }}>
            [ KIOSK #01 ]
          </span>
          <div className="kiosk-timer">{currentTime}</div>
        </div>
      </header>

      {/* Kiosk Main Split Screen */}
      <main className="kiosk-main">
        {/* Left Side: Menu Grid */}
        <section className="menu-area">
          <CategoryNav
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />
          
          <div className="menu-grid-container">
            <div className="menu-grid">
              {filteredMenuItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onClick={handleMenuItemClick}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Right Side: Order Cart Panel */}
        <OrderCart
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onClearCart={handleClearCart}
          onCheckout={() => setShowCheckout(true)}
        />
      </main>

      {/* Customize Options Modal */}
      {customizingItem && (
        <CustomizeModal
          item={customizingItem}
          onClose={() => setCustomizingItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Checkout Selection & Processing Modal */}
      {showCheckout && (
        <CheckoutModal
          cartItems={cartItems}
          onClose={handleCheckoutClose}
          onOrderSuccess={handleOrderSuccess}
          clearCart={handleClearCart}
        />
      )}
    </div>
  );
}

export default App;
