import React, { useState } from 'react';
import { useAppSelector } from '../../services/hooks';
import { Modal } from '../modal/modal';
import { OrderDetails } from '../order-details/order-details';
import { BurgerIngredients }  from '../burger-ingredients/burger-ingredients';
import { BurgerConstructor } from '../burger-constructor/burger-constructor';
import { AppHeader } from '../app-header/app-header';
import styles from './app.module.css';

export const App: React.FC = () => {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const { order } = useAppSelector(state => state.order);

  // Открываем модальное окно, когда получаем номер заказа
  React.useEffect(() => {
    if (order) {
      setIsOrderModalOpen(true);
    }
  }, [order]);

  const handleCloseOrderModal = () => {
    setIsOrderModalOpen(false);
  };

  return (
    <div className={styles.app}>
      <AppHeader />
      <main className={styles.main}>
        <BurgerIngredients />
        <BurgerConstructor />
      </main>

      {isOrderModalOpen && (
        <Modal onClose={handleCloseOrderModal}>
          <OrderDetails />
        </Modal>
      )}
    </div>
  );
}; 