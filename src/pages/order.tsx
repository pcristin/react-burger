import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../services/hooks';
import { fetchOrderDetails } from '../services/feedSlice';
import { setCurrentOrder } from '../services/currentOrderSlice';
import { fetchIngredients } from '../services/ingredientsSlice';
import { OrderDetails } from '../components/order-details/order-details';
import styles from './order.module.css';

export const OrderPage: React.FC = () => {
  const { number } = useParams<{ number: string }>();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { loading: orderLoading, error: orderError } = useAppSelector(state => state.currentOrder);
  const { items: ingredients, loading: ingredientsLoading } = useAppSelector(state => state.ingredients);
  const { orders: feedOrders } = useAppSelector(state => state.feed);
  const { orders: userOrders } = useAppSelector(state => state.userOrders);
  
  // Determine if this is a profile order
  const isProfileOrder = location.pathname.includes('/profile/orders/');
  
  console.log(`OrderPage: Rendering order #${number}, isProfileOrder: ${isProfileOrder}`);
  
  // Load ingredients if they're not already loaded
  useEffect(() => {
    if (ingredients.length === 0 && !ingredientsLoading) {
      console.log('OrderPage: Loading ingredients data');
      dispatch(fetchIngredients());
    }
  }, [dispatch, ingredients.length, ingredientsLoading]);

  // When component mounts or number changes, try to find the order
  useEffect(() => {
    if (number) {
      // Try to find the order in existing data
      console.log(`OrderPage: Looking for order #${number} in existing data`);
      
      // First try to find the order in the current state
      const orderFromFeed = feedOrders.find(o => String(o.number) === number);
      const orderFromUserOrders = userOrders.find(o => String(o.number) === number);
      const orderToShow = orderFromFeed || orderFromUserOrders;

      if (orderToShow) {
        console.log(`Found order #${number} in state, using cached data`);
        dispatch(setCurrentOrder(orderToShow));
      } else {
        // If order is not in current state, fetch it from API
        console.log(`Order #${number} not found in state, fetching from API`);
        dispatch(fetchOrderDetails(number));
      }
    }
  }, [dispatch, number, feedOrders, userOrders]);

  // Determine if we're still loading either ingredients or order details
  const isLoading = orderLoading || (ingredientsLoading && ingredients.length === 0);

  return (
    <div className={styles.container}>
      {isLoading ? (
        <p className={styles.loading}>Загрузка заказа #{number}...</p>
      ) : orderError ? (
        <p className={styles.error}>{orderError}</p>
      ) : (
        <OrderDetails modal={false} />
      )}
    </div>
  );
}; 