import '@testing-library/jest-dom';
import reducer, { fetchIngredients } from './ingredientsSlice';
import { TIngredientsState, TIngredient } from '../utils/types';

describe('ingredients reducer', () => {
  const initialState: TIngredientsState = {
    items: [],
    loading: false,
    error: null,
  };

  // Mock ingredient for testing
  const mockIngredients: TIngredient[] = [
    {
      _id: 'ingredient1',
      name: 'Test Ingredient 1',
      type: 'main',
      proteins: 10,
      fat: 10,
      carbohydrates: 10,
      calories: 100,
      price: 100,
      image: 'image1.png',
      image_mobile: 'image1-mobile.png',
      image_large: 'image1-large.png',
      __v: 0
    },
    {
      _id: 'ingredient2',
      name: 'Test Ingredient 2',
      type: 'bun',
      proteins: 5,
      fat: 5,
      carbohydrates: 5,
      calories: 50,
      price: 50,
      image: 'image2.png',
      image_mobile: 'image2-mobile.png',
      image_large: 'image2-large.png',
      __v: 0
    }
  ];

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: '' })).toEqual(initialState);
  });

  it('should handle fetchIngredients.pending', () => {
    const action = { type: fetchIngredients.pending.type };
    const state = reducer(initialState, action);
    
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle fetchIngredients.fulfilled', () => {
    const action = { 
      type: fetchIngredients.fulfilled.type, 
      payload: mockIngredients 
    };
    const state = reducer(initialState, action);
    
    expect(state.loading).toBe(false);
    expect(state.items).toEqual(mockIngredients);
    expect(state.error).toBeNull();
  });

  it('should handle fetchIngredients.rejected', () => {
    const errorMessage = 'Failed to fetch ingredients';
    const action = { 
      type: fetchIngredients.rejected.type,
      error: { message: errorMessage }
    };
    const state = reducer(initialState, action);
    
    expect(state.loading).toBe(false);
    expect(state.items).toEqual([]);
    expect(state.error).toBe(errorMessage);
  });
}); 