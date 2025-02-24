import React from 'react';
import { IngredientCard } from '../ingredient-card/ingredient-card';
import { TIngredient } from '../../utils/types';
import styles from '../burger-ingredients/burger-ingredients.module.css';

type TTabValue = 'bun' | 'sauce' | 'main';

type TIngredientGroupProps = {
  ingredients: TIngredient[];
  type: TTabValue;
  groupRef: React.RefObject<HTMLDivElement>;
  headerRef: React.RefObject<HTMLHeadingElement>;
  title: string;
};

export const IngredientGroup: React.FC<TIngredientGroupProps> = ({ 
  ingredients, 
  type, 
  groupRef, 
  headerRef, 
  title 
}) => (
  <div id={type} ref={groupRef} className={styles.group}>
    <h2 ref={headerRef} className={styles.groupTitle}>{title}</h2>
    <div className={styles.groupContent}>
      {ingredients.map(item => (
        <IngredientCard key={item._id} ingredient={item} />
      ))}
    </div>
  </div>
); 