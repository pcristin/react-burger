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
  const { order, loading: orderLoading, error: orderError } = useAppSelector(state => state.order);
  const { order: currentOrder, loading: currentOrderLoading, error: currentOrderError } = useAppSelector(state => state.currentOrder);
  const { items, loading: ingredientsLoading } = useAppSelector(state => state.ingredients);
  
  // Определяем, какой заказ отображать в зависимости от контекста
  // Если это новый заказ (в модальном окне создания заказа), используем заказ из orderSlice
  // В противном случае, используем заказ из currentOrderSlice (для истории заказов/ленты заказов)
  const orderToDisplay = order && !modal ? order : currentOrder;
  const loading = modal ? currentOrderLoading : orderLoading;
  const error = modal ? currentOrderError : orderError;

  // Check if we're still loading ingredients
  const isLoading = loading || (ingredientsLoading && items.length === 0);

  // Автоматическое закрытие модального окна только для новых заказов
  React.useEffect(() => {
    if (order && !orderLoading && !modal) {
      console.log('The order is loaded, it will be reset after 2 seconds');
      const timer = setTimeout(() => {
        console.log('Resetting order state');
        dispatch(resetOrder());
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [order, orderLoading, dispatch, modal]);

  if (isLoading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }
  
  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!orderToDisplay) {
    return <div className={styles.loading}>Нет данных о заказе</div>;
  }

  if (items.length === 0) {
    return <div className={styles.loading}>Загрузка ингредиентов...</div>;
  }

  // Для заказа, который только что создан
  if (!modal && order && order === orderToDisplay) {
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

  // Группировка ингредиентов по ID и подсчет количества вхождений
  const ingredientCounts: Record<string, number> = {};
  if (orderToDisplay.ingredients && Array.isArray(orderToDisplay.ingredients)) {
    orderToDisplay.ingredients.forEach(id => {
      if (id) {
        ingredientCounts[id] = (ingredientCounts[id] || 0) + 1;
      }
    });
  }

  // Получение уникальных ингредиентов с их деталями
  const uniqueIngredients = Object.keys(ingredientCounts).map(id => {
    const ingredient = items.find(item => item._id === id);
    return {
      _id: id,
      count: ingredientCounts[id],
      ingredient
    };
  });

  // Расчет общей стоимости
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