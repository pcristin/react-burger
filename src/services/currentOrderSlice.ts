import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TCurrentOrderState, TOrderFeed } from '../utils/types';
import { fetchOrderDetails } from './feedSlice';

// Initial state for current order
const initialState: TCurrentOrderState = {
  order: null,
  loading: false,
  error: null
};

// Create slice for current order details
const currentOrderSlice = createSlice({
  name: 'currentOrder',
  initialState,
  reducers: {
    // Set current order
    setCurrentOrder: (state, action: PayloadAction<TOrderFeed>) => {
      state.order = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    // Reset current order
    resetCurrentOrder: (state) => {
      state.order = null;
      state.loading = false;
      state.error = null;
    },
    
    // Reset error state
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setCurrentOrder, resetCurrentOrder, resetError } = currentOrderSlice.actions;
export default currentOrderSlice.reducer; 