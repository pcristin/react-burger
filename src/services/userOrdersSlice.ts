import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TUserOrdersState, TAllOrdersResponse } from '../utils/types';
import { getCookie } from '../utils/cookie';
import {
  WS_CONNECTION_START,
  WS_CONNECTION_SUCCESS,
  WS_CONNECTION_ERROR,
  WS_CONNECTION_CLOSED,
  WS_GET_MESSAGE
} from './middleware/socketMiddleware';

// URL for the WebSocket connection with auth
const USER_ORDERS_WS_URL = 'wss://norma.nomoreparties.space/orders';

// Helper function to extract user ID from JWT token
const getUserIdFromToken = (token: string): string | null => {
  try {
    // Remove 'Bearer ' prefix if present
    const cleanToken = token.replace('Bearer ', '');
    
    // Split the token into parts
    const tokenParts = cleanToken.split('.');
    if (tokenParts.length !== 3) {
      console.error('Invalid JWT token format');
      return null;
    }
    
    // Decode the payload (second part)
    const payload = JSON.parse(atob(tokenParts[1]));
    return payload.id || null;
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
};

// Map actions to middleware actions
export const userOrdersWsActions = {
  wsConnect: WS_CONNECTION_START,
  wsConnected: WS_CONNECTION_SUCCESS,
  wsError: WS_CONNECTION_ERROR,
  wsDisconnect: WS_CONNECTION_CLOSED,
  wsMessage: WS_GET_MESSAGE
};

// Initial state for user orders
const initialState: TUserOrdersState = {
  orders: [],
  total: 0,
  totalToday: 0,
  loading: true,
  error: null
};

// Create slice for user orders
const userOrdersSlice = createSlice({
  name: 'userOrders',
  initialState,
  reducers: {
    // Connect to the user orders WebSocket
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
      state.loading = false;
    },
    
    // Received message from WebSocket
    getMessage: (state, action: PayloadAction<TAllOrdersResponse>) => {
      try {
        const data = action.payload;
        
        // Log full raw data for debugging
        console.log('User orders WebSocket response:', data);
        
        // Make sure data is valid and has expected format
        if (!data || !data.success) {
          console.error('Invalid user orders response format:', data);
          state.error = 'Invalid response from server';
          state.loading = false;
          return;
        }
        
        const { orders, total, totalToday } = data;
        
        // Debug what we're receiving from the server
        console.log(`Received ${orders.length} user orders from WebSocket`);
        
        // Check if orders array is empty
        if (orders.length === 0) {
          console.log('No orders received from server for this user');
        } else {
          // Log a sample order for debugging 
          console.log('Sample order:', orders[0]);
        }
        
        // According to requirements, the API should return maximum 50 user orders,
        // sorted by update time. We should not need to filter them as the endpoint
        // already handles authentication via the token parameter.
        
        // Update state with the authenticated user's orders
        state.orders = orders;
        state.total = total;
        state.totalToday = totalToday;
        state.loading = false;
        state.error = null;
        
        console.log(`Updated user orders state with ${orders.length} orders`);
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
        state.error = "Error processing user orders data";
        state.loading = false;
      }
    }
  }
});

// Map WebSocket action types to reducer actions
export const userOrdersWsActionReducers = {
  [WS_CONNECTION_START]: userOrdersSlice.actions.connect,
  [WS_CONNECTION_SUCCESS]: userOrdersSlice.actions.connectionSuccess,
  [WS_CONNECTION_ERROR]: userOrdersSlice.actions.connectionError,
  [WS_CONNECTION_CLOSED]: userOrdersSlice.actions.connectionClosed,
  [WS_GET_MESSAGE]: userOrdersSlice.actions.getMessage
};

// Action creator to start WebSocket connection for user orders
export const startUserOrdersConnection = () => {
  const token = getCookie('token');
  
  if (!token) {
    console.error('No authentication token found');
    return { 
      type: WS_CONNECTION_ERROR, 
      payload: 'No authentication token available' 
    };
  }
  
  // Ensure token is properly formatted (remove Bearer if present)
  const cleanToken = token.replace('Bearer ', '');
  
  // Verify that the token includes a valid user ID
  const userId = getUserIdFromToken(cleanToken);
  if (!userId) {
    console.error('Could not extract user ID from token');
    return {
      type: WS_CONNECTION_ERROR,
      payload: 'Invalid authentication token'
    };
  }
  
  // Use the proper endpoint for user orders - the URL needs to include the token
  const url = `${USER_ORDERS_WS_URL}?token=${cleanToken}`;
  
  console.log('Connecting to user orders with URL:', url);
  console.log('User ID from token:', userId);
  
  return {
    type: WS_CONNECTION_START,
    payload: url
  };
};

// Action creator to close WebSocket connection
export const closeUserOrdersConnection = () => ({
  type: WS_CONNECTION_CLOSED
});

export const { connect, disconnect, resetError } = userOrdersSlice.actions;
export default userOrdersSlice.reducer; 