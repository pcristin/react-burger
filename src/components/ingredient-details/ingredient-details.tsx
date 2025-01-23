import React from 'react';
import styles from './ingredient-details.module.css';
import { IIngredient } from '../../utils/data';
import PropTypes from 'prop-types';

interface IngredientDetailsProps {
  ingredient: IIngredient;
}

export const IngredientDetails: React.FC<IngredientDetailsProps> = ({ ingredient }) => {
  return (
    <div className={styles.details}>
      <img src={ingredient.image_large} alt={ingredient.name} className={styles.image} />
      <h3 className="text text_type_main-medium mt-4 mb-8">{ingredient.name}</h3>
      <ul className={styles.nutrients}>
        <li className={styles.nutrient}>
          <span className="text text_type_main-default text_color_inactive">Калории,ккал</span>
          <span className="text text_type_digits-default text_color_inactive">{ingredient.calories}</span>
        </li>
        <li className={styles.nutrient}>
          <span className="text text_type_main-default text_color_inactive">Белки, г</span>
          <span className="text text_type_digits-default text_color_inactive">{ingredient.proteins}</span>
        </li>
        <li className={styles.nutrient}>
          <span className="text text_type_main-default text_color_inactive">Жиры, г</span>
          <span className="text text_type_digits-default text_color_inactive">{ingredient.fat}</span>
        </li>
        <li className={styles.nutrient}>
          <span className="text text_type_main-default text_color_inactive">Углеводы, г</span>
          <span className="text text_type_digits-default text_color_inactive">{ingredient.carbohydrates}</span>
        </li>
      </ul>
    </div>
  );
};

IngredientDetails.propTypes = {
  ingredient: PropTypes.shape({
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
  }).isRequired
} as any; 