import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createOrder } from '../utils/api';
import { TOrderState } from '../utils/types';

export const submitOrder = createAsyncThunk(
  'order/submitOrder',
  async (ingredients: string[], { rejectWithValue }) => {
    try {
      console.log('Submitting order with ingredients:', ingredients);
      const response = await createOrder(ingredients);
      console.log('Order creation response:', response);
      return {
        number: response.order.number,
        name: response.name
      };
    } catch (error) {
      console.error('Error creating order:', error);
      return rejectWithValue('Произошла ошибка при создании заказа');
    }
  }
);

const initialState: TOrderState = {
  order: null,
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    resetOrder: (state) => {
      state.order = null;
      state.loading = false;
      state.error = null;
    },
    
    orderSuccess: (state, action) => {
      state.order = action.payload;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(submitOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' 
          ? action.payload 
          : action.error.message || 'Произошла ошибка при создании заказа';
      });
  },
});

export const { resetOrder, orderSuccess } = orderSlice.actions;

export default orderSlice.reducer; 