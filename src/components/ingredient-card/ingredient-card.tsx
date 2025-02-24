import React, { useMemo } from 'react';
import { useDrag } from 'react-dnd';
import { Link, useLocation } from 'react-router-dom';
import { Counter, CurrencyIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import { TIngredient } from '../../utils/types';
import { useAppSelector, useAppDispatch } from '../../services/hooks';
import { setCurrentIngredient } from '../../services/currentIngredientSlice';
import styles from './ingredient-card.module.css';

type TIngredientCardProps = {
  ingredient: TIngredient;
};

export const IngredientCard: React.FC<TIngredientCardProps> = ({ ingredient }) => {
  const { bun, ingredients = [] } = useAppSelector(state => state.constructor);
  const dispatch = useAppDispatch();
  const location = useLocation();

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

  const handleClick = () => {
    dispatch(setCurrentIngredient(ingredient));
  };

  return (
    <Link
      to={`/ingredients/${ingredient._id}`}
      state={{ background: location }}
      className={styles.link}
      onClick={handleClick}
    >
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
    </Link>
  );
}; 