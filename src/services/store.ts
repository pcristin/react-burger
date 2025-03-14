import { configureStore } from '@reduxjs/toolkit';
import ingredientsReducer from './ingredientsSlice';
import constructorReducer from './constructorSlice';
import currentIngredientReducer from './currentIngredientSlice';
import orderReducer from './orderSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    ingredients: ingredientsReducer,
    constructor: constructorReducer,
    currentIngredient: currentIngredientReducer,
    order: orderReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 