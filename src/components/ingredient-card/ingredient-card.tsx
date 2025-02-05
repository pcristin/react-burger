import React, { useMemo } from 'react';
import { useDrag } from 'react-dnd';
import { Counter, CurrencyIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import { TIngredient } from '../../utils/types';
import { useAppSelector } from '../../services/hooks';
import styles from './ingredient-card.module.css';

type TIngredientCardProps = {
  ingredient: TIngredient;
};

export const IngredientCard: React.FC<TIngredientCardProps> = ({ ingredient }) => {
  const { bun, ingredients = [] } = useAppSelector(state => state.constructor);

  const count = useMemo(() => {
    if (ingredient.type === 'bun') {
      return bun?._id === ingredient._id ? 2 : 0;
    }
    return ingredients.filter(item => item._id === ingredient._id).length;
  }, [ingredient, bun, ingredients]);

  const [{ isDragging }, dragRef] = useDrag({
    type: 'ingredient',
    item: ingredient,
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  });

  return (
    <div 
      ref={dragRef}
      className={styles.card}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {count > 0 && <Counter count={count} size="default" />}
      <img src={ingredient.image} alt={ingredient.name} className={styles.image} />
      <div className={styles.price}>
        <span className="text text_type_digits-default">{ingredient.price}</span>
        <CurrencyIcon type="primary" />
      </div>
      <p className={`${styles.name} text text_type_main-default`}>{ingredient.name}</p>
    </div>
  );
}; 