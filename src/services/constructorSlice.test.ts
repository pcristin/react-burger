import '@testing-library/jest-dom';
import reducer, {
  addIngredient,
  removeIngredient,
  moveIngredient,
  resetConstructor,
  initialState
} from './constructorSlice';
import { TIngredient, TConstructorIngredient } from '../utils/types';

describe('constructor reducer', () => {
  
  // Mock ingredients for testing
  const mockBun: TIngredient = {
    _id: 'bun-id',
    name: 'Test Bun',
    type: 'bun',
    proteins: 10,
    fat: 10,
    carbohydrates: 10,
    calories: 100,
    price: 100,
    image: 'bun-image.png',
    image_mobile: 'bun-image-mobile.png',
    image_large: 'bun-image-large.png',
    __v: 0
  };

  const mockIngredient: TIngredient = {
    _id: 'ingredient-id',
    name: 'Test Ingredient',
    type: 'main',
    proteins: 5,
    fat: 5,
    carbohydrates: 5,
    calories: 50,
    price: 50,
    image: 'ingredient-image.png',
    image_mobile: 'ingredient-image-mobile.png',
    image_large: 'ingredient-image-large.png',
    __v: 0
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: '' })).toEqual(initialState);
  });

  it('should handle addIngredient with bun', () => {
    const newState = reducer(initialState, addIngredient(mockBun));
    expect(newState.bun).not.toBeNull();
    expect(newState.bun?.type).toBe('bun');
    expect(newState.bun?._id).toBe('bun-id');
    expect((newState.bun as TConstructorIngredient)?.uniqueId).toBeDefined();
  });

  it('should handle addIngredient with non-bun ingredient', () => {
    const newState = reducer(initialState, addIngredient(mockIngredient));
    expect(newState.ingredients.length).toBe(1);
    expect(newState.ingredients[0].type).toBe('main');
    expect(newState.ingredients[0]._id).toBe('ingredient-id');
    expect(newState.ingredients[0].uniqueId).toBeDefined();
  });

  it('should handle removeIngredient', () => {
    // First add an ingredient
    let state = reducer(initialState, addIngredient(mockIngredient));
    const uniqueId = state.ingredients[0].uniqueId;
    
    // Then remove it
    state = reducer(state, removeIngredient(uniqueId));
    expect(state.ingredients.length).toBe(0);
  });

  it('should handle moveIngredient', () => {
    // Add two ingredients
    let state = reducer(initialState, addIngredient(mockIngredient));
    state = reducer(state, addIngredient({...mockIngredient, _id: 'ingredient-id-2'}));
    
    // Get names before moving
    const firstIngredientId = state.ingredients[0]._id;
    const secondIngredientId = state.ingredients[1]._id;
    
    // Move the second ingredient to first position
    state = reducer(state, moveIngredient({ dragIndex: 1, hoverIndex: 0 }));
    
    // Check if order is reversed
    expect(state.ingredients[0]._id).toBe(secondIngredientId);
    expect(state.ingredients[1]._id).toBe(firstIngredientId);
  });

  it('should handle resetConstructor', () => {
    // Add some ingredients
    let state = reducer(initialState, addIngredient(mockBun));
    state = reducer(state, addIngredient(mockIngredient));
    
    // Reset the constructor
    state = reducer(state, resetConstructor());
    
    // Check if state is back to initial
    expect(state).toEqual(initialState);
  });
}); 