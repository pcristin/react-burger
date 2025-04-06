import { configureStore } from '@reduxjs/toolkit';
import ingredientsReducer from './ingredientsSlice';
import constructorReducer from './constructorSlice';
import currentIngredientReducer from './currentIngredientSlice';
import orderReducer from './orderSlice';
import authReducer from './authSlice';
import feedReducer from './feedSlice';
import userOrdersReducer from './userOrdersSlice';
import currentOrderReducer from './currentOrderSlice';
import { socketMiddleware } from './middleware/socketMiddleware';
import { wsActions, wsActionReducers } from './feedSlice';
import { userOrdersWsActions, userOrdersWsActionReducers } from './userOrdersSlice';

// Create middleware instances
console.log('Creating feed WebSocket middleware with:', { wsActions, wsActionReducers });
const feedMiddleware = socketMiddleware(wsActions, wsActionReducers);
console.log('Creating user orders WebSocket middleware with:', { userOrdersWsActions, userOrdersWsActionReducers });
const userOrdersMiddleware = socketMiddleware(userOrdersWsActions, userOrdersWsActionReducers);

export const store = configureStore({
  reducer: {
    ingredients: ingredientsReducer,
    constructor: constructorReducer,
    currentIngredient: currentIngredientReducer,
    order: orderReducer,
    auth: authReducer,
    feed: feedReducer,
    userOrders: userOrdersReducer,
    currentOrder: currentOrderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(feedMiddleware, userOrdersMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Log the store structure after creation
console.log('Store created with reducers:', Object.keys(store.getState()));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 