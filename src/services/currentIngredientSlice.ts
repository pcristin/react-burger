import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TCurrentIngredientState, TIngredient } from '../utils/types';

const initialState: TCurrentIngredientState = {
  ingredient: null,
};

const currentIngredientSlice = createSlice({
  name: 'currentIngredient',
  initialState,
  reducers: {
    setCurrentIngredient: (state, action: PayloadAction<TIngredient>) => {
      state.ingredient = action.payload;
    },
    resetCurrentIngredient: (state) => {
      state.ingredient = null;
    },
  },
});

export const { setCurrentIngredient, resetCurrentIngredient } = currentIngredientSlice.actions;

export default currentIngredientSlice.reducer; 