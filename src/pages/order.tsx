import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../services/hooks';
import { fetchOrderDetails } from '../services/feedSlice';
import { OrderDetails } from '../components/order-details/order-details';
import styles from './order.module.css';

export const OrderPage: React.FC = () => {
  const { number } = useParams<{ number: string }>();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.currentOrder);

  useEffect(() => {
    if (number) {
      dispatch(fetchOrderDetails(number));
    }
  }, [dispatch, number]);

  return (
    <div className={styles.container}>
      {loading ? (
        <p className={styles.loading}>Загрузка...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : (
        <OrderDetails />
      )}
    </div>
  );
}; 