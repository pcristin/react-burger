import React, { useCallback, useMemo } from 'react';
import { useDrop } from 'react-dnd';
import { 
  ConstructorElement,
  Button,
  CurrencyIcon
} from '@ya.praktikum/react-developer-burger-ui-components';
import { useAppDispatch, useAppSelector } from '../../services/hooks';
import { 
  addIngredient,
  removeIngredient,
  moveIngredient
} from '../../services/constructorSlice';
import { submitOrder } from '../../services/orderSlice';
import { TIngredient } from '../../utils/types';
import { DraggableConstructorElement } from '../draggable-constructor-element/draggable-constructor-element';
import styles from './burger-constructor.module.css';

export const BurgerConstructor: React.FC = () => {
  const dispatch = useAppDispatch();
  const { bun, ingredients = [] } = useAppSelector(state => state.constructor);
  const { loading } = useAppSelector(state => state.order);

  const [{ isHover }, dropTarget] = useDrop({
    accept: 'ingredient',
    drop(item: TIngredient) {
      dispatch(addIngredient(item));
    },
    collect: monitor => ({
      isHover: monitor.isOver()
    })
  });

  const handleRemove = useCallback((uniqueId: string) => {
    dispatch(removeIngredient(uniqueId));
  }, [dispatch]);

  const handleMove = useCallback((dragIndex: number, hoverIndex: number) => {
    dispatch(moveIngredient({ dragIndex, hoverIndex }));
  }, [dispatch]);

  const totalPrice = useMemo(() => {
    const bunPrice = bun ? bun.price * 2 : 0;
    const ingredientsPrice = ingredients.reduce((sum, item) => sum + item.price, 0);
    return bunPrice + ingredientsPrice;
  }, [bun, ingredients]);

  const handleOrder = () => {
    if (!bun) return;
    
    const ingredientIds = [
      bun._id,
      ...ingredients.map(item => item._id),
      bun._id
    ];
    
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
        {ingredients.map((item, index) => (
          <DraggableConstructorElement
            key={item.uniqueId}
            ingredient={item}
            index={index}
            handleRemove={() => handleRemove(item.uniqueId)}
            handleMove={handleMove}
          />
        ))}
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