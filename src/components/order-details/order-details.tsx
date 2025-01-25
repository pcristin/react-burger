import React from 'react';
import { CheckMarkIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './order-details.module.css';

export const OrderDetails: React.FC = () => {
  return (
    <div className={styles.details}>
      <p className="text text_type_digits-large mb-8">034536</p>
      <p className="text text_type_main-medium mb-15">идентификатор заказа</p>
      <CheckMarkIcon type="primary" />
      <p className="text text_type_main-default mb-2">Ваш заказ начали готовить</p>
      <p className="text text_type_main-default text_color_inactive">
        Дождитесь готовности на орбитальной станции
      </p>
    </div>
  );
}; 