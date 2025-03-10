import React from 'react';
import { useAppSelector } from '../../services/hooks';
import styles from './ingredient-details.module.css';
import { TIngredient } from '../../utils/types';

type TIngredientDetailsProps = {
  ingredient?: TIngredient;
};

export const IngredientDetails: React.FC<TIngredientDetailsProps> = ({ ingredient: propIngredient }) => {
  const { ingredient: storeIngredient } = useAppSelector(state => state.currentIngredient);
  
  // Use the ingredient from props if provided, otherwise use from store
  const ingredient = propIngredient || storeIngredient;

  if (!ingredient) {
    return <div className={styles.container}>Ингредиент не найден</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={`${styles.title} text text_type_main-large`}>Детали ингредиента</h2>
      <img src={ingredient.image_large} alt={ingredient.name} className={styles.image} />
      <p className={`${styles.name} text text_type_main-medium mt-4`}>{ingredient.name}</p>
      
      <div className={`${styles.nutrients} mt-8`}>
        <div className={styles.nutrient}>
          <p className="text text_type_main-default text_color_inactive">Калории,ккал</p>
          <p className="text text_type_digits-default text_color_inactive">{ingredient.calories}</p>
        </div>
        <div className={styles.nutrient}>
          <p className="text text_type_main-default text_color_inactive">Белки, г</p>
          <p className="text text_type_digits-default text_color_inactive">{ingredient.proteins}</p>
        </div>
        <div className={styles.nutrient}>
          <p className="text text_type_main-default text_color_inactive">Жиры, г</p>
          <p className="text text_type_digits-default text_color_inactive">{ingredient.fat}</p>
        </div>
        <div className={styles.nutrient}>
          <p className="text text_type_main-default text_color_inactive">Углеводы, г</p>
          <p className="text text_type_digits-default text_color_inactive">{ingredient.carbohydrates}</p>
        </div>
      </div>
    </div>
  );
}; 