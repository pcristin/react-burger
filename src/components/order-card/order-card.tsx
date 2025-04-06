import React from 'react';
import { useAppSelector } from '../../services/hooks';
import { TOrderFeed } from '../../utils/types';
import { CurrencyIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './order-card.module.css';

interface OrderCardProps {
  order: TOrderFeed;
  price: number;
  showStatus?: boolean;
}

// Helper function to format order status text
const formatStatus = (status: string): string => {
  switch (status) {
    case 'done':
      return 'Выполнен';
    case 'pending':
      return 'Готовится';
    case 'created':
      return 'Создан';
    default:
      return 'Отменен';
  }
};

// Helper function to format order status class
const getStatusClass = (status: string): string => {
  switch (status) {
    case 'done':
      return styles.statusDone;
    case 'pending':
      return styles.statusPending;
    case 'created':
      return styles.statusCreated;
    default:
      return styles.statusCancelled;
  }
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  let dayText = '';
  if (diffDays === 0) {
    dayText = 'Сегодня';
  } else if (diffDays === 1) {
    dayText = 'Вчера';
  } else if (diffDays > 1 && diffDays < 5) {
    dayText = `${diffDays} дня назад`;
  } else {
    dayText = `${diffDays} дней назад`;
  }
  
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${dayText}, ${hours}:${minutes} GMT+3`;
};

export const OrderCard: React.FC<OrderCardProps> = ({ order, price, showStatus = true }) => {
  const { items } = useAppSelector(state => state.ingredients);
  
  // Get unique ingredients to display (max 6)
  const ingredientsToShow = Array.from(new Set(order.ingredients)).slice(0, 6);
  const hasMoreIngredients = order.ingredients.length > 6;
  const hiddenCount = order.ingredients.length - 6;
  
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.number}>#{order.number}</span>
        <span className={styles.date}>{formatDate(order.createdAt)}</span>
      </div>
      
      <h2 className={styles.title}>{order.name}</h2>
      
      {showStatus && (
        <div className={`${styles.status} ${getStatusClass(order.status)}`}>
          {formatStatus(order.status)}
        </div>
      )}
      
      <div className={styles.footer}>
        <div className={styles.ingredients}>
          {ingredientsToShow.map((id, index) => {
            const ingredient = items.find(item => item._id === id);
            if (!ingredient) return null;
            
            return (
              <div 
                key={index} 
                className={styles.ingredient}
                style={{ zIndex: 6 - index }}
              >
                <img 
                  src={ingredient.image_mobile} 
                  alt={ingredient.name} 
                  className={styles.ingredientImage} 
                />
                {index === 5 && hasMoreIngredients && (
                  <div className={styles.moreCount}>+{hiddenCount}</div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className={styles.price}>
          <span className={styles.priceValue}>{price}</span>
          <CurrencyIcon type="primary" />
        </div>
      </div>
    </div>
  );
}; 