import { useState, useEffect } from 'react';
import styles from './App.module.css';
import { AppHeader } from './components/app-header/app-header';
import { BurgerIngredients } from './components/burger-ingredients/burger-ingredients';
import { BurgerConstructor } from './components/burger-constructor/burger-constructor';
import { Modal } from './components/modal/modal';
import { OrderDetails } from './components/order-details/order-details';
import { IngredientDetails } from './components/ingredient-details/ingredient-details';
import { request } from './utils/api';
import { IIngredient } from './utils/data';

function App() {
  const [ingredients, setIngredients] = useState<IIngredient[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<IIngredient | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const data = await request('/ingredients');
        setIngredients(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке ингредиентов');
      }
    };

    fetchIngredients();
  }, []);

  const handleIngredientClick = (ingredient: IIngredient) => {
    setSelectedIngredient(ingredient);
  };

  const handleCloseModals = () => {
    setSelectedIngredient(null);
    setIsOrderModalOpen(false);
  };

  const handleOrderClick = () => {
    setIsOrderModalOpen(true);
  };

  if (error) {
    return <div className="text text_type_main-default">{error}</div>;
  }

  return (
    <div className={styles.app}>
      <AppHeader />
      <main className={styles.main}>
        <BurgerIngredients ingredients={ingredients} onIngredientClick={handleIngredientClick} />
        <BurgerConstructor ingredients={ingredients} onOrderClick={handleOrderClick} />
      </main>

      {selectedIngredient && (
        <Modal title="Детали ингредиента" onClose={handleCloseModals}>
          <IngredientDetails ingredient={selectedIngredient} />
        </Modal>
      )}

      {isOrderModalOpen && (
        <Modal onClose={handleCloseModals}>
          <OrderDetails />
        </Modal>
      )}
    </div>
  );
}

export default App;
