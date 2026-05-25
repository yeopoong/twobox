// frontend/src/components/MenuItemCard.tsx
import React from 'react';

export interface Option {
  id: string;
  name: string;
  price: number;
  type: string;
}

export interface MenuItem {
  id: number;
  name: string;
  english_name: string;
  category: string;
  price: number;
  calories: number;
  description: string;
  image_url: string;
  options: Option[];
}

interface MenuItemCardProps {
  item: MenuItem;
  onClick: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onClick }) => {
  return (
    <div className="menu-card" onClick={() => onClick(item)}>
      <div className="menu-card-image-wrapper">
        <img
          src={item.image_url}
          alt={item.name}
          className="menu-card-image"
          loading="lazy"
        />
        <div className="menu-card-calories">{item.calories} kcal</div>
      </div>
      
      <div className="menu-card-info">
        <h3 className="menu-card-name">{item.name}</h3>
        <span className="menu-card-eng-name">{item.english_name}</span>
        <p className="menu-card-desc">{item.description}</p>
        
        <div className="menu-card-footer">
          <span className="menu-card-price">{item.price.toLocaleString()}원</span>
          <button className="menu-card-add-btn">
            <span>+</span>
          </button>
        </div>
      </div>
    </div>
  );
};
