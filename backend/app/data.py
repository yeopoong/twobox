# backend/app/data.py

CATEGORIES = [
    {"id": "burgers", "name": "버거", "icon": "🍔"},
    {"id": "sides", "name": "사이드", "icon": "🍟"},
    {"id": "drinks", "name": "음료", "icon": "🥤"},
    {"id": "desserts", "name": "디저트", "icon": "🍦"},
]

MENU_ITEMS = [
    # Burgers
    {
        "id": 1,
        "name": "시그니처 비프 버거",
        "english_name": "Signature Beef Burger",
        "category": "burgers",
        "price": 8500,
        "calories": 650,
        "description": "100% 순쇠고기 패티와 신선한 야채, 특제 비법 소스가 조화를 이루는 프리미엄 시그니처 버거",
        "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
        "options": [
            {"id": "cheese", "name": "체다치즈 추가", "price": 500, "type": "addon"},
            {"id": "patty", "name": "쇠고기 패티 추가", "price": 2000, "type": "addon"},
            {"id": "bacon", "name": "베이컨 추가", "price": 1000, "type": "addon"},
        ]
    },
    {
        "id": 2,
        "name": "트러플 머쉬룸 버거",
        "english_name": "Truffle Mushroom Burger",
        "category": "burgers",
        "price": 9500,
        "calories": 710,
        "description": "풍부한 향의 트러플 크림 소스와 쫄깃한 그릴 버섯이 촉촉한 패티와 어우러진 버거",
        "image_url": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80",
        "options": [
            {"id": "cheese", "name": "체다치즈 추가", "price": 500, "type": "addon"},
            {"id": "patty", "name": "쇠고기 패티 추가", "price": 2000, "type": "addon"},
        ]
    },
    {
        "id": 3,
        "name": "크리스피 치킨 버거",
        "english_name": "Crispy Chicken Burger",
        "category": "burgers",
        "price": 7500,
        "calories": 580,
        "description": "바삭하게 튀겨낸 두툼한 통닭다리살 패티에 아삭한 코울슬로가 더해진 스파이시 치킨 버거",
        "image_url": "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80",
        "options": [
            {"id": "cheese", "name": "체다치즈 추가", "price": 500, "type": "addon"},
            {"id": "spicy", "name": "더 맵게", "price": 0, "type": "choice"},
        ]
    },
    {
        "id": 4,
        "name": "더블 치즈 아보카도 버거",
        "english_name": "Double Cheese Avocado Burger",
        "category": "burgers",
        "price": 10500,
        "calories": 780,
        "description": "두 장의 체다 치즈와 신선한 아보카도 슬라이스를 담아 극강의 고소함을 자랑하는 프리미엄 버거",
        "image_url": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80",
        "options": [
            {"id": "patty", "name": "쇠고기 패티 추가", "price": 2000, "type": "addon"},
            {"id": "bacon", "name": "베이컨 추가", "price": 1000, "type": "addon"},
        ]
    },
    
    # Sides
    {
        "id": 5,
        "name": "골든 크리스피 감자튀김",
        "english_name": "French Fries",
        "category": "sides",
        "price": 2500,
        "calories": 320,
        "description": "겉은 바삭하고 속은 촉촉하게 갓 튀겨낸 고소한 감자튀김",
        "image_url": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80",
        "options": [
            {"id": "size_large", "name": "L 사이즈 업", "price": 800, "type": "size"},
            {"id": "sauce_cheese", "name": "치즈 소스 추가", "price": 500, "type": "addon"},
            {"id": "sauce_chili", "name": "칠리 소스 추가", "price": 700, "type": "addon"},
        ]
    },
    {
        "id": 6,
        "name": "모짜렐라 치즈볼 (4pcs)",
        "english_name": "Mozzarella Cheese Balls",
        "category": "sides",
        "price": 3500,
        "calories": 290,
        "description": "바삭한 찹쌀 피 속에 쫄깃한 고소함이 가득한 자연산 모짜렐라 치즈가 가득한 치즈볼",
        "image_url": "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=600&auto=format&fit=crop&q=80",
        "options": []
    },
    {
        "id": 7,
        "name": "크런치 어니언 링",
        "english_name": "Crunchy Onion Rings",
        "category": "sides",
        "price": 3000,
        "calories": 250,
        "description": "신선한 양파를 통째로 썰어 바삭한 튀김옷을 입혀 튀겨낸 식감 천재 어니언 링",
        "image_url": "https://images.unsplash.com/photo-1639024471283-2bc7b3c6a267?w=600&auto=format&fit=crop&q=80",
        "options": [
            {"id": "sauce_ranch", "name": "랜치 소스 추가", "price": 500, "type": "addon"}
        ]
    },

    # Drinks
    {
        "id": 8,
        "name": "코카콜라 / 제로콜라",
        "english_name": "Coca Cola / Zero",
        "category": "drinks",
        "price": 2000,
        "calories": 140,
        "description": "기름진 입맛을 깔끔하게 잡아줄 톡 쏘는 청량감의 탄산음료",
        "image_url": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80",
        "options": [
            {"id": "regular", "name": "일반 코카콜라", "price": 0, "type": "choice"},
            {"id": "zero", "name": "제로 코카콜라", "price": 0, "type": "choice"},
            {"id": "size_large", "name": "L 사이즈 업", "price": 500, "type": "size"},
            {"id": "no_ice", "name": "얼음 제외", "price": 0, "type": "choice"},
        ]
    },
    {
        "id": 9,
        "name": "레몬에이드",
        "english_name": "Lemonade",
        "category": "drinks",
        "price": 3000,
        "calories": 180,
        "description": "생레몬 즙을 직접 착즙하여 더욱 상콤하고 달콤한 청량 에이드",
        "image_url": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
        "options": [
            {"id": "size_large", "name": "L 사이즈 업", "price": 500, "type": "size"},
            {"id": "less_sweet", "name": "덜 달게", "price": 0, "type": "choice"},
        ]
    },
    {
        "id": 10,
        "name": "바닐라 쉐이크",
        "english_name": "Vanilla Shake",
        "category": "drinks",
        "price": 3800,
        "calories": 420,
        "description": "진한 우유 생크림과 천연 바닐라 빈이 블렌딩되어 달콤하고 꾸덕한 쉐이크",
        "image_url": "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=600&auto=format&fit=crop&q=80",
        "options": []
    },

    # Desserts
    {
        "id": 11,
        "name": "소프트 밀크 아이스크림",
        "english_name": "Soft Milk Ice Cream",
        "category": "desserts",
        "price": 1800,
        "calories": 190,
        "description": "1등급 원유를 사용하여 매일 신선하게 제조하는 부드럽고 진한 우유 맛 아이스크림",
        "image_url": "https://images.unsplash.com/photo-1560008511-11c63416e52d?w=600&auto=format&fit=crop&q=80",
        "options": [
            {"id": "cup", "name": "컵에 담기", "price": 0, "type": "choice"},
            {"id": "cone", "name": "콘에 담기", "price": 0, "type": "choice"},
            {"id": "choco_syrup", "name": "초코 시럽 추가", "price": 300, "type": "addon"},
        ]
    },
    {
        "id": 12,
        "name": "애플 시나몬 파이",
        "english_name": "Apple Cinnamon Pie",
        "category": "desserts",
        "price": 2200,
        "calories": 240,
        "description": "바삭하고 고소한 페이스트리 시트 속에 달콤한 사과 과육과 향긋한 시나몬이 듬뿍 들어간 파이",
        "image_url": "https://images.unsplash.com/photo-1519869325930-281384150729?w=600&auto=format&fit=crop&q=80",
        "options": []
    }
]

# 메모리 상에서 주문 내역을 저장할 간단한 리스트와 시퀀스 번호
ORDERS = []
ORDER_COUNTER = 100
