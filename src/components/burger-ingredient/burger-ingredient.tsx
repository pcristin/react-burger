import React from 'react';
import styles from './burger-ingredient.module.css';
import { Counter, CurrencyIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import { IIngredient } from '../../utils/data';
import PropTypes from 'prop-types';
import { IngredientType } from '../../utils/types';

interface BurgerIngredientProps {
  ingredient: IIngredient;
  count?: number;
  onClick: (ingredient: IIngredient) => void;
}

export const BurgerIngredient: React.FC<BurgerIngredientProps> = ({ ingredient, count = 0, onClick }) => {
  const handleClick = () => {
    onClick(ingredient);
  };

  return (
    <div className={styles.ingredient} onClick={handleClick} data-test-id="ingredient">
      {count > 0 && <Counter count={count} size="default" />}
      <img className="ml-4 mr-4" src={ingredient.image} alt={ingredient.name} />
      <div className={styles.price}>
        <span className="text text_type_digits-default mr-2">{ingredient.price}</span>
        <CurrencyIcon type="primary" />
      </div>
      <p className={`${styles.name} text text_type_main-default`}>{ingredient.name}</p>
    </div>
  );
};

BurgerIngredient.propTypes = {
  ingredient: IngredientType.isRequired,
  count: PropTypes.number,
  onClick: PropTypes.func.isRequired
} as any; 