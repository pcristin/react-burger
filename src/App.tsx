
import React, { useState } from 'react';
import { useAppSelector } from './services/hooks';
import styles from './App.module.css';
import { AppHeader } from './components/app-header/app-header';
import { BurgerIngredients } from './components/burger-ingredients/burger-ingredients';
import { BurgerConstructor } from './components/burger-constructor/burger-constructor';
import { Modal } from './components/modal/modal';
import { OrderDetails } from './components/order-details/order-details';

function App() {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const { order } = useAppSelector(state => state.order);

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
}

export default App; 