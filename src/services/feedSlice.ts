import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getOrderDetails } from '../utils/api';
import { TOrderFeed, TOrderFeedState } from '../utils/types';
import {
  WS_CONNECTION_START,
  WS_CONNECTION_SUCCESS,
  WS_CONNECTION_ERROR,
  WS_CONNECTION_CLOSED,
  WS_GET_MESSAGE
} from './middleware/socketMiddleware';

// URL for the WebSocket connections
const ALL_ORDERS_WS_URL = 'wss://norma.nomoreparties.space/orders/all';

// Action types for the middleware
export const feedWsActions = {
  wsConnect: WS_CONNECTION_START,
  wsConnected: WS_CONNECTION_SUCCESS,
  wsError: WS_CONNECTION_ERROR,
  wsDisconnect: WS_CONNECTION_CLOSED,
  wsMessage: WS_GET_MESSAGE
};

// Get order details by number
export const fetchOrderDetails = createAsyncThunk<TOrderFeed, string>(
  'feed/fetchOrderDetails',
  async (number, { rejectWithValue }) => {
    try {
      console.log(`Fetching order details for order #${number}`);
      const response = await getOrderDetails(number);
      
      if (!response.success) {
        console.error('Failed to fetch order details:', response);
        return rejectWithValue('Failed to fetch order details');
      }
      
      console.log('Order details received:', response);
      return response.orders[0];
    } catch (error) {
      console.error('Error fetching order details:', error);
      return rejectWithValue('Error fetching order details');
    }
  }
);

// Initial state for the all orders feed
const initialState: TOrderFeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  loading: false,
  error: null
};

// Create slice for all orders feed
const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    // Connect to the all orders WebSocket
    connect: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    // Disconnect from the WebSocket
    disconnect: (state) => {
      state.loading = false;
    },
    
    // Reset error state
    resetError: (state) => {
      state.error = null;
    },
    
    // WebSocket connection established
    connectionSuccess: (state) => {
      state.error = null;
      state.loading = true;
    },
    
    // WebSocket connection error
    connectionError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    // WebSocket connection closed
    connectionClosed: (state) => {
      // Don't reset the orders on close to prevent UI flashing
      state.loading = false;
    },
    
    // Received message from WebSocket
    getMessage: (state, action: PayloadAction<any>) => {
      try {
        const data = action.payload;
        console.log("Raw WebSocket payload received:", data);
        console.log("Current state before update:", { 
          ordersCount: state.orders.length, 
          total: state.total, 
          totalToday: state.totalToday 
        });
        
        // Ensure data exists and has expected structure before updating state
        if (data && typeof data === 'object') {
          // Safely extract and validate the data
          const orders = Array.isArray(data.orders) ? data.orders : [];
          const total = typeof data.total === 'number' ? data.total : 0;
          const totalToday = typeof data.totalToday === 'number' ? data.totalToday : 0;
          
          // Debug the data we're about to set
          console.log("Updating feed state with validated data:", {
            ordersCount: orders.length,
            total,
            totalToday
          });
          
          // Update state with new values
          state.orders = orders;
          state.total = total;
          state.totalToday = totalToday;
          state.loading = false;
          state.error = null;
          
          console.log("Updated feed state:", {
            ordersCount: state.orders.length,
            total: state.total,
            totalToday: state.totalToday
          });
        } else {
          console.error("Invalid feed data structure:", data);
          state.error = "Invalid data received";
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
        state.error = "Error processing feed data";
        state.loading = false;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state) => {
        state.loading = false;
        // The current order details will be managed in currentOrderSlice
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

// Map actions to middleware actions
export const wsActions = {
  wsConnect: WS_CONNECTION_START,
  wsConnected: WS_CONNECTION_SUCCESS,
  wsError: WS_CONNECTION_ERROR,
  wsDisconnect: WS_CONNECTION_CLOSED,
  wsMessage: WS_GET_MESSAGE
};

// Map WebSocket action types to reducer actions
export const wsActionReducers = {
  [WS_CONNECTION_START]: feedSlice.actions.connect,
  [WS_CONNECTION_SUCCESS]: feedSlice.actions.connectionSuccess,
  [WS_CONNECTION_ERROR]: feedSlice.actions.connectionError,
  [WS_CONNECTION_CLOSED]: feedSlice.actions.connectionClosed,
  [WS_GET_MESSAGE]: feedSlice.actions.getMessage
};

// Action creator to start WebSocket connection for all orders
export const startFeedConnection = () => {
  console.log('Connecting to feed orders with URL:', ALL_ORDERS_WS_URL);
  
  return {
    type: WS_CONNECTION_START,
    payload: ALL_ORDERS_WS_URL
  };
};

// Action creator to close WebSocket connection
export const closeFeedConnection = () => ({
  type: WS_CONNECTION_CLOSED
});

export const { connect, disconnect, resetError } = feedSlice.actions;
export default feedSlice.reducer; 