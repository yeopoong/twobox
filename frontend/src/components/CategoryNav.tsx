// frontend/src/components/CategoryNav.tsx
import React from 'react';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategoryNavProps {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (id: string) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <nav className="category-nav">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
          onClick={() => onSelectCategory(category.id)}
        >
          <span style={{ fontSize: '20px' }}>{category.icon}</span>
          <span>{category.name}</span>
        </button>
      ))}
    </nav>
  );
};
