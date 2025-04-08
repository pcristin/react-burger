import React, { useMemo, useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
import { useNavigate } from 'react-router-dom';
import { 
  ConstructorElement,
  Button,
  CurrencyIcon
} from '@ya.praktikum/react-developer-burger-ui-components';
import { useAppDispatch, useAppSelector } from '../../services/hooks';
import { 
  addIngredient,
  removeIngredient,
  moveIngredient,
  resetConstructor
} from '../../services/constructorSlice';
import { submitOrder, resetOrder } from '../../services/orderSlice';
import { TIngredient } from '../../utils/types';
import { DraggableConstructorElement } from '../draggable-constructor-element/draggable-constructor-element';
import styles from './burger-constructor.module.css';

export const BurgerConstructor: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { bun, ingredients = [] } = useAppSelector(state => state.constructor);
  const { order, loading, error } = useAppSelector(state => state.order);
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Сбрасываем конструктор после успешного создания заказа
  useEffect(() => {
    if (order && orderPlaced) {
      console.log('Order created successfully, resetting constructor');
      dispatch(resetConstructor());
      
      // Добавляем таймаут для автоматического закрытия модального окна заказа
      const timer = setTimeout(() => {
        console.log('Resetting order after timeout');
        dispatch(resetOrder());
        setOrderPlaced(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [order, orderPlaced, dispatch]);

  // Показываем ошибку, если она есть
  useEffect(() => {
    if (error) {
      console.error('Order creation error:', error);
      setOrderPlaced(false);
    }
  }, [error]);

  const [{ isHover }, dropTarget] = useDrop({
    accept: 'ingredient',
    drop(item: TIngredient) {
      dispatch(addIngredient(item));
    },
    collect: monitor => ({
      isHover: monitor.isOver()
    })
  });

  const handleRemove = (uniqueId: string) => {
    dispatch(removeIngredient(uniqueId));
  };

  const handleMove = (dragIndex: number, hoverIndex: number) => {
    dispatch(moveIngredient({ dragIndex, hoverIndex }));
  };

  const totalPrice = useMemo(() => {
    const bunPrice = bun ? bun.price * 2 : 0;
    const ingredientsPrice = ingredients.reduce((sum, item) => sum + item.price, 0);
    return bunPrice + ingredientsPrice;
  }, [bun, ingredients]);

  const handleOrder = () => {
    if (!bun) return;
    
    // If user is not authenticated, redirect to login
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/' } } });
      return;
    }
    
    const ingredientIds = [
      bun._id,
      ...ingredients.map(item => item._id),
      bun._id
    ];
    
    console.log('Placing order with ingredients:', ingredientIds);
    setOrderPlaced(true);
    dispatch(submitOrder(ingredientIds));
  };

  return (
    <div 
      ref={dropTarget}
      className={`${styles.constructor} ${isHover ? styles.hover : ''}`}
    >
      {bun && (
        <div className={styles.bun}>
          <ConstructorElement
            type="top"
            isLocked={true}
            text={`${bun.name} (верх)`}
            price={bun.price}
            thumbnail={bun.image}
          />
        </div>
      )}

      <div className={styles.ingredients}>
        {ingredients.length > 0 ? (
          ingredients.map((item, index) => (
            <DraggableConstructorElement
              key={item.uniqueId}
              ingredient={item}
              index={index}
              handleRemove={() => handleRemove(item.uniqueId)}
              handleMove={handleMove}
            />
          ))
        ) : (
          <div className={styles.emptyIngredients}>
            <span className="text text_type_main-default text_color_inactive">
              Перетащите ингредиенты сюда
            </span>
          </div>
        )}
      </div>

      {bun && (
        <div className={styles.bun}>
          <ConstructorElement
            type="bottom"
            isLocked={true}
            text={`${bun.name} (низ)`}
            price={bun.price}
            thumbnail={bun.image}
          />
        </div>
      )}

      <div className={styles.total}>
        <div className={styles.price}>
          <span className="text text_type_digits-medium">{totalPrice}</span>
          <CurrencyIcon type="primary" />
        </div>
        <Button
          htmlType="button"
          type="primary"
          size="large"
          onClick={handleOrder}
          disabled={!bun || loading}
        >
          {loading ? 'Оформляем заказ...' : 'Оформить заказ'}
        </Button>
      </div>
    </div>
  );
};
