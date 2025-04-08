import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../services/hooks';
import * as WebSocketManager from '../services/websocketManager';
import { fetchIngredients } from '../services/ingredientsSlice';
import { OrderCard } from '../components/order-card/order-card';
import styles from './feed.module.css';

export const FeedPage: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { orders, total, totalToday, loading, error } = useAppSelector(state => state.feed);
  const { items, loading: ingredientsLoading } = useAppSelector(state => state.ingredients);
  
  // Load ingredients if they're not already loaded
  useEffect(() => {
    if (items.length === 0 && !ingredientsLoading) {
      console.log('FeedPage: Loading ingredients data');
      dispatch(fetchIngredients());
    }
  }, [dispatch, items.length, ingredientsLoading]);
  
  // Connect to WebSocket when component mounts
  useEffect(() => {
    // Устанавливаем соединение через глобальный менеджер
    console.log('FeedPage mounted, connecting via WebSocket Manager');
    WebSocketManager.connect('feed');
    
    // Отсоединяемся только при полном размонтировании (не при обновлении)
    return () => {
      console.log('FeedPage unmounted (cleanup function)');
      // Не закрываем соединение автоматически, оно будет управляться менеджером
    };
  }, []);

  // Calculate order price by summing up ingredient prices
  const calculateOrderPrice = (ingredientIds: string[]) => {
    return ingredientIds.reduce((total, id) => {
      const ingredient = items.find(item => item._id === id);
      return total + (ingredient ? ingredient.price : 0);
    }, 0);
  };

  // Check if we're still loading data
  const isLoading = loading || (ingredientsLoading && items.length === 0);

  // Separate orders into "done" and "in progress"
  const doneOrders = orders.filter(order => order.status === 'done').slice(0, 20);
  const inProgressOrders = orders.filter(order => order.status === 'pending' || order.status === 'created').slice(0, 20);

  // Split done orders into columns (max 10 per column)
  const doneOrdersColumn1 = doneOrders.slice(0, 10);
  const doneOrdersColumn2 = doneOrders.slice(10, 20);

  // Debug logs
  console.log("Feed render state:", { 
    ordersCount: orders.length, 
    total, 
    totalToday, 
    loading,
    ingredientsLoading,
    ingredientsCount: items.length,
    error,
    doneCount: doneOrders.length,
    inProgressCount: inProgressOrders.length
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Лента заказов</h1>
      
      <div className={styles.content}>
        {/* Orders List */}
        <div className={styles.ordersContainer}>
          {isLoading ? (
            <p className={styles.loading}>Загрузка заказов...</p>
          ) : error ? (
            <p className={styles.error}>{error}</p>
          ) : orders.length === 0 ? (
            <p className={styles.loading}>Ожидание данных с сервера...</p>
          ) : items.length === 0 ? (
            <p className={styles.loading}>Загрузка ингредиентов...</p>
          ) : (
            <ul className={styles.ordersList}>
              {orders.map(order => (
                <li key={order._id}>
                  <Link
                    to={`/feed/${order.number}`}
                    state={{ background: location }}
                    className={styles.orderLink}
                  >
                    <OrderCard
                      order={order}
                      price={calculateOrderPrice(order.ingredients)}
                      showStatus={false}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Orders Stats */}
        <div className={styles.statsContainer}>
          {/* Orders Status */}
          <div className={styles.statusContainer}>
            <div className={styles.statusColumn}>
              <h2 className={styles.statusTitle}>Готовы:</h2>
              <ul className={styles.statusList}>
                {doneOrdersColumn1.map(order => (
                  <li key={order._id} className={styles.doneOrder}>
                    {order.number}
                  </li>
                ))}
              </ul>
              {doneOrdersColumn2.length > 0 && (
                <ul className={styles.statusList}>
                  {doneOrdersColumn2.map(order => (
                    <li key={order._id} className={styles.doneOrder}>
                      {order.number}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className={styles.statusColumn}>
              <h2 className={styles.statusTitle}>В работе:</h2>
              <ul className={styles.statusList}>
                {inProgressOrders.map(order => (
                  <li key={order._id} className={styles.inProgressOrder}>
                    {order.number}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Completed Orders */}
          <div className={styles.completedContainer}>
            <h2 className={styles.completedTitle}>Выполнено за все время:</h2>
            <span className={styles.completedValue}>{total}</span>
          </div>
          
          {/* Completed Today */}
          <div className={styles.completedContainer}>
            <h2 className={styles.completedTitle}>Выполнено за сегодня:</h2>
            <span className={styles.completedValue}>{totalToday}</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 