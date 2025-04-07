import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TCurrentOrderState, TOrderFeed } from '../utils/types';
import { fetchOrderDetails } from './feedSlice';

// Initial state for current order
const initialState: TCurrentOrderState = {
  order: null,
  loading: false,
  error: null
};

// Check if we have any saved order in sessionStorage from a previous session
const savedOrder = sessionStorage.getItem('currentOrder');
if (savedOrder) {
  try {
    const parsedOrder = JSON.parse(savedOrder);
    if (parsedOrder && typeof parsedOrder === 'object') {
      console.log('Restored order from sessionStorage:', parsedOrder.number);
      initialState.order = parsedOrder;
    }
  } catch (e) {
    console.error('Error parsing saved order:', e);
    sessionStorage.removeItem('currentOrder');
  }
}

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
      // Save to sessionStorage for persistence across refreshes
      sessionStorage.setItem('currentOrder', JSON.stringify(action.payload));
    },
    
    // Reset current order
    resetCurrentOrder: (state) => {
      state.order = null;
      state.loading = false;
      state.error = null;
      // Clear from sessionStorage
      sessionStorage.removeItem('currentOrder');
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
        // Save to sessionStorage
        sessionStorage.setItem('currentOrder', JSON.stringify(action.payload));
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setCurrentOrder, resetCurrentOrder, resetError } = currentOrderSlice.actions;
export default currentOrderSlice.reducer; 