import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TConstructorState, TIngredient, TConstructorIngredient } from '../utils/types';
import { v4 as uuidv4 } from 'uuid';

const initialState: TConstructorState = {
  bun: null,
  ingredients: [],
};

const createConstructorIngredient = (ingredient: TIngredient): TConstructorIngredient => ({
  ...ingredient,
  uniqueId: uuidv4(),
});

export const constructorSlice = createSlice({
  name: 'constructor',
  initialState,
  reducers: {
    addIngredient(state, action: PayloadAction<TIngredient>) {
      const newState = { ...state };
      
      if (action.payload.type === 'bun') {
        newState.bun = createConstructorIngredient(action.payload);
      } else {
        newState.ingredients = [
          ...(newState.ingredients || []),
          createConstructorIngredient(action.payload),
        ];
      }
      
      return newState;
    },
    removeIngredient(state, action: PayloadAction<string>) {
      return {
        ...state,
        ingredients: state.ingredients.filter(
          (item) => item.uniqueId !== action.payload
        ),
      };
    },
    moveIngredient(state, action: PayloadAction<{ dragIndex: number; hoverIndex: number }>) {
      const { dragIndex, hoverIndex } = action.payload;
      const newIngredients = [...state.ingredients];
      const dragItem = newIngredients[dragIndex];
      
      if (dragItem) {
        newIngredients.splice(dragIndex, 1);
        newIngredients.splice(hoverIndex, 0, dragItem);
        
        return {
          ...state,
          ingredients: newIngredients,
        };
      }
      
      return state;
    },
    resetConstructor() {
      return initialState;
    },
  },
});

export const {
  addIngredient,
  removeIngredient,
  moveIngredient,
  resetConstructor,
} = constructorSlice.actions;

export default constructorSlice.reducer; 