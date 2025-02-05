import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createOrder } from '../utils/api';
import { TOrderState } from '../utils/types';

export const submitOrder = createAsyncThunk(
  'order/submitOrder',
  async (ingredients: string[]) => {
    const response = await createOrder(ingredients);
    return response.order;
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
      state.error = null;
    },
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
        state.error = action.error.message || 'Произошла ошибка при создании заказа';
      });
  },
});

export const { resetOrder } = orderSlice.actions;

export default orderSlice.reducer; 