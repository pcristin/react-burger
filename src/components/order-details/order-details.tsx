import React from 'react';
import { CheckMarkIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import { useAppSelector } from '../../services/hooks';
import styles from './order-details.module.css';

export const OrderDetails: React.FC = () => {
  const { order, loading, error } = useAppSelector(state => state.order);

  if (loading) {
    return (
      <div className={styles.container}>
        <p className="text text_type_main-medium">
          Оформляем заказ...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <p className="text text_type_main-medium text_color_error">
          {error}
        </p>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className={styles.container}>
      <p className={`${styles.orderNumber} text text_type_digits-large`}>
        {order.number}
      </p>
      <p className="text text_type_main-medium mt-8">
        идентификатор заказа
      </p>
      <div className={styles.checkMark}>
        <CheckMarkIcon type="primary" />
      </div>
      <p className="text text_type_main-default mt-15">
        Ваш заказ начали готовить
      </p>
      <p className="text text_type_main-default text_color_inactive mt-2">
        Дождитесь готовности на орбитальной станции
      </p>
    </div>
  );
}; 