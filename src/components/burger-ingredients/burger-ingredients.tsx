import React, { useState } from 'react';
import { Tab, CurrencyIcon, Counter } from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './burger-ingredients.module.css';
import { IIngredient } from '../../utils/data';
import PropTypes from 'prop-types';

interface BurgerIngredientsProps {
  ingredients: IIngredient[];
  onIngredientClick: (ingredient: IIngredient) => void;
}

export const BurgerIngredients: React.FC<BurgerIngredientsProps> = ({ ingredients, onIngredientClick }) => {
  const [current, setCurrent] = useState('bun');

  const buns = ingredients.filter(item => item.type === 'bun');
  const sauces = ingredients.filter(item => item.type === 'sauce');
  const mains = ingredients.filter(item => item.type === 'main');

  const renderIngredient = (item: IIngredient) => (
    <article key={item._id} className={styles.card} onClick={() => onIngredientClick(item)}>
      <Counter count={1} size="default" />
      <img src={item.image} alt={item.name} className={styles.image} />
      <div className={styles.price}>
        <span className="text text_type_digits-default">{item.price}</span>
        <CurrencyIcon type="primary" />
      </div>
      <p className={`${styles.name} text text_type_main-default`}>{item.name}</p>
    </article>
  );

  return (
    <section className={styles.section}>
      <h1 className="text text_type_main-large mb-5">Соберите бургер</h1>
      
      <div className={styles.tabs}>
        <Tab value="bun" active={current === 'bun'} onClick={setCurrent}>
          Булки
        </Tab>
        <Tab value="sauce" active={current === 'sauce'} onClick={setCurrent}>
          Соусы
        </Tab>
        <Tab value="main" active={current === 'main'} onClick={setCurrent}>
          Начинки
        </Tab>
      </div>

      <div className={styles.ingredients}>
        <div className={styles.category}>
          <h2 className="text text_type_main-medium">Булки</h2>
          <div className={styles.items}>
            {buns.map(renderIngredient)}
          </div>
        </div>

        <div className={styles.category}>
          <h2 className="text text_type_main-medium">Соусы</h2>
          <div className={styles.items}>
            {sauces.map(renderIngredient)}
          </div>
        </div>

        <div className={styles.category}>
          <h2 className="text text_type_main-medium">Начинки</h2>
          <div className={styles.items}>
            {mains.map(renderIngredient)}
          </div>
        </div>
      </div>
    </section>
  );
};

BurgerIngredients.propTypes = {
  ingredients: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['bun', 'main', 'sauce']).isRequired,
      proteins: PropTypes.number.isRequired,
      fat: PropTypes.number.isRequired,
      carbohydrates: PropTypes.number.isRequired,
      calories: PropTypes.number.isRequired,
      price: PropTypes.number.isRequired,
      image: PropTypes.string.isRequired,
      image_mobile: PropTypes.string.isRequired,
      image_large: PropTypes.string.isRequired,
      __v: PropTypes.number.isRequired
    })
  ).isRequired,
  onIngredientClick: PropTypes.func.isRequired
} as any;
