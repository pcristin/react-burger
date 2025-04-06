import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '../services/hooks';
import * as WebSocketManager from '../services/websocketManager';
import { OrderCard } from '../components/order-card/order-card';
import styles from './profile-orders.module.css';

export const ProfileOrdersPage: React.FC = () => {
  const location = useLocation();
  const { orders, loading, error } = useAppSelector(state => state.userOrders);
  const { items } = useAppSelector(state => state.ingredients);
  const { isAuthenticated } = useAppSelector(state => state.auth);

  // Connect to WebSocket when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      console.log('ProfileOrdersPage mounted, authenticated user detected');
      
      // First ensure any existing connections are properly closed
      WebSocketManager.disconnect('userOrders');
      
      // Give a small delay before reconnecting
      const timer = setTimeout(() => {
        console.log('Establishing user orders WebSocket connection');
        WebSocketManager.connect('userOrders');
      }, 500);
      
      // Clear timer if component unmounts before timer fires
      return () => {
        console.log('ProfileOrdersPage cleaning up');
        clearTimeout(timer);
        WebSocketManager.disconnect('userOrders');
      };
    } else {
      console.log('User not authenticated, WebSocket connection not started');
    }
  }, [isAuthenticated]);

  // Log order data changes
  useEffect(() => {
    console.log(`Profile orders updated: ${orders.length} orders available`);
    
    if (orders.length > 0) {
      console.log('Most recent order:', orders[0]);
    }
  }, [orders]);

  // Calculate order price by summing up ingredient prices
  const calculateOrderPrice = (ingredientIds: string[]) => {
    return ingredientIds.reduce((total, id) => {
      const ingredient = items.find(item => item._id === id);
      return total + (ingredient ? ingredient.price : 0);
    }, 0);
  };

  // Orders are displayed with newest first
  const sortedOrders = [...orders].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className={styles.container}>
      {loading ? (
        <p className={styles.loading}>Загрузка заказов...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : sortedOrders.length === 0 ? (
        <p className={styles.empty}>У вас пока нет заказов</p>
      ) : (
        <ul className={styles.ordersList}>
          {sortedOrders.map(order => (
            <li key={order._id}>
              <Link
                to={`/profile/orders/${order.number}`}
                state={{ background: location }}
                className={styles.orderLink}
              >
                <OrderCard
                  order={order}
                  price={calculateOrderPrice(order.ingredients)}
                  showStatus={true}
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}; 