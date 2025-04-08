import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../services/hooks';
import * as WebSocketManager from '../services/websocketManager';
import { fetchIngredients } from '../services/ingredientsSlice';
import { OrderCard } from '../components/order-card/order-card';
import styles from './profile-orders.module.css';

export const ProfileOrdersPage: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { orders, loading: ordersLoading, error } = useAppSelector(state => state.userOrders);
  const { items, loading: ingredientsLoading } = useAppSelector(state => state.ingredients);
  const { isAuthenticated } = useAppSelector(state => state.auth);

  // Log component mount
  useEffect(() => {
    console.log('PROFILE ORDERS PAGE MOUNTED');
  }, []);

  // Load ingredients if they're not already loaded
  useEffect(() => {
    if (items.length === 0 && !ingredientsLoading) {
      console.log('ProfileOrdersPage: Loading ingredients data');
      dispatch(fetchIngredients());
    }
  }, [dispatch, items.length, ingredientsLoading]);

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

  // Check if we're still loading data
  const isLoading = ordersLoading || (ingredientsLoading && items.length === 0);

  return (
    <div className={styles.container}>
      {isLoading ? (
        <p className={styles.loading}>Загрузка заказов...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : sortedOrders.length === 0 ? (
        <p className={styles.empty}>У вас пока нет заказов</p>
      ) : items.length === 0 ? (
        <p className={styles.loading}>Загрузка ингредиентов...</p>
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