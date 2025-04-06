import React from 'react';
import { useAppSelector, useAppDispatch } from '../../services/hooks';
import { CurrencyIcon, CheckMarkIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import { resetOrder } from '../../services/orderSlice';
import styles from './order-details.module.css';

interface OrderDetailsProps {
  modal?: boolean;
}

// Helper function to format order status text
const formatStatus = (status?: string): string => {
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
const getStatusClass = (status?: string): string => {
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
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Дата неизвестна';
  
  try {
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
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Ошибка даты';
  }
};

export const OrderDetails: React.FC<OrderDetailsProps> = ({ modal = false }) => {
  const dispatch = useAppDispatch();
  const { order, loading, error } = useAppSelector(state => state.order);
  const { order: currentOrder } = useAppSelector(state => state.currentOrder);
  const { items } = useAppSelector(state => state.ingredients);
  
  // Используем текущий заказ для деталей, если это не модальное окно создания заказа
  const orderToDisplay = modal && currentOrder ? currentOrder : order;

  // Автоматическое закрытие модального окна через 2 секунды после завершения загрузки
  React.useEffect(() => {
    if (order && !loading) {
      console.log('Order loaded, will reset after 2 seconds');
      const timer = setTimeout(() => {
        console.log('Resetting order state');
        dispatch(resetOrder());
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [order, loading, dispatch]);

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }
  
  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!orderToDisplay) {
    return <div className={styles.loading}>Нет данных о заказе</div>;
  }

  // Для обычного заказа, который только что создан
  if (!modal && order) {
    return (
      <div className={styles.container}>
        <p className={styles.number}>#{order.number}</p>
        <h1 className={styles.title}>Идентификатор заказа</h1>
        
        <div className={styles.checkMark}>
          <CheckMarkIcon type="primary" />
        </div>
        
        <p className={styles.status}>Ваш заказ начали готовить</p>
        <p className={styles.message}>Дождитесь готовности на орбитальной станции</p>
      </div>
    );
  }

  // Group ingredients by ID and count occurrences
  const ingredientCounts: Record<string, number> = {};
  if (orderToDisplay.ingredients && Array.isArray(orderToDisplay.ingredients)) {
    orderToDisplay.ingredients.forEach(id => {
      if (id) {
        ingredientCounts[id] = (ingredientCounts[id] || 0) + 1;
      }
    });
  }

  // Get unique ingredients with their details
  const uniqueIngredients = Object.keys(ingredientCounts).map(id => {
    const ingredient = items.find(item => item._id === id);
    return {
      _id: id,
      count: ingredientCounts[id],
      ingredient
    };
  });

  // Calculate total price
  const totalPrice = uniqueIngredients.reduce((total, { count, ingredient }) => {
    return total + (ingredient ? ingredient.price * count : 0);
  }, 0);

  return (
    <div className={`${styles.container} ${modal ? styles.modal : ''}`}>
      <p className={styles.number}>#{orderToDisplay.number}</p>
      <h1 className={styles.title}>{orderToDisplay.name || 'Без названия'}</h1>
      
      <div className={`${styles.status} ${getStatusClass(orderToDisplay.status)}`}>
        {formatStatus(orderToDisplay.status)}
      </div>
      
      <div className={styles.composition}>
        <h2 className={styles.compositionTitle}>Состав:</h2>
        
        <ul className={styles.ingredientsList}>
          {uniqueIngredients.map(({ _id, count, ingredient }) => {
            if (!ingredient) return null;
            
            return (
              <li key={_id} className={styles.ingredientItem}>
                <div className={styles.ingredientIcon}>
                  <img 
                    src={ingredient.image_mobile} 
                    alt={ingredient.name} 
                    className={styles.ingredientImage} 
                  />
                </div>
                <p className={styles.ingredientName}>{ingredient.name}</p>
                <div className={styles.ingredientPrice}>
                  <span className={styles.count}>{count} x </span>
                  <span className={styles.price}>{ingredient.price}</span>
                  <CurrencyIcon type="primary" />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      
      <div className={styles.footer}>
        <span className={styles.date}>{formatDate(orderToDisplay.createdAt)}</span>
        
        <div className={styles.totalPrice}>
          <span className={styles.totalValue}>{totalPrice}</span>
          <CurrencyIcon type="primary" />
        </div>
      </div>
    </div>
  );
}; 