import '@testing-library/jest-dom';
import reducer, { setCurrentIngredient, resetCurrentIngredient } from './currentIngredientSlice';
import { TCurrentIngredientState, TIngredient } from '../utils/types';

describe('currentIngredient reducer', () => {
  const initialState: TCurrentIngredientState = {
    ingredient: null,
  };

  // Mock ingredient for testing
  const mockIngredient: TIngredient = {
    _id: 'ingredient-id',
    name: 'Test Ingredient',
    type: 'main',
    proteins: 10,
    fat: 10,
    carbohydrates: 10,
    calories: 100,
    price: 100,
    image: 'image.png',
    image_mobile: 'image-mobile.png',
    image_large: 'image-large.png',
    __v: 0
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: '' })).toEqual(initialState);
  });

  it('should handle setCurrentIngredient', () => {
    const newState = reducer(initialState, setCurrentIngredient(mockIngredient));
    expect(newState.ingredient).toEqual(mockIngredient);
  });

  it('should handle resetCurrentIngredient', () => {
    // First set a current ingredient
    let state = reducer(initialState, setCurrentIngredient(mockIngredient));
    
    // Then reset it
    state = reducer(state, resetCurrentIngredient());
    
    // Check if state is back to initial
    expect(state).toEqual(initialState);
    expect(state.ingredient).toBeNull();
  });
}); 