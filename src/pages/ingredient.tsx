import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../services/hooks';
import { fetchIngredients } from '../services/ingredientsSlice';
import { setCurrentIngredient } from '../services/currentIngredientSlice';
import { IngredientDetails } from '../components/ingredient-details/ingredient-details';
import styles from './ingredient.module.css';

export const IngredientPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector(state => state.ingredients);
  
  useEffect(() => {
    // If ingredients are not loaded yet, fetch them
    if (items.length === 0) {
      dispatch(fetchIngredients());
    } else {
      // Find the ingredient by id and set it as current
      const ingredient = items.find(item => item._id === id);
      if (ingredient) {
        dispatch(setCurrentIngredient(ingredient));
      }
    }
  }, [dispatch, id, items]);

  // When ingredients are loaded, find the ingredient and set it as current
  useEffect(() => {
    if (items.length > 0) {
      const ingredient = items.find(item => item._id === id);
      if (ingredient) {
        dispatch(setCurrentIngredient(ingredient));
      }
    }
  }, [dispatch, id, items]);

  if (loading) {
    return <div className={styles.container}>Загрузка...</div>;
  }

  if (error) {
    return <div className={styles.container}>Ошибка: {error}</div>;
  }

  const ingredient = items.find(item => item._id === id);
  
  if (!ingredient) {
    return <div className={styles.container}>Ингредиент не найден</div>;
  }

  return (
    <div className={styles.container}>
      <IngredientDetails ingredient={ingredient} />
    </div>
  );
}; 