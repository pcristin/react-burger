import '@testing-library/jest-dom';
import reducer, { resetOrder, orderSuccess, submitOrder } from './orderSlice';
import { TOrderState, TOrder } from '../utils/types';

describe('order reducer', () => {
  const initialState: TOrderState = {
    order: null,
    loading: false,
    error: null,
  };

  // Mock order for testing
  const mockOrder: TOrder = {
    number: 12345,
    name: 'Test Order'
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: '' })).toEqual(initialState);
  });

  it('should handle resetOrder', () => {
    // Set up initial state with order data
    const stateWithOrder = {
      order: mockOrder,
      loading: false,
      error: null,
    };
    
    // Reset the order
    const state = reducer(stateWithOrder, resetOrder());
    
    // Check if state is back to initial
    expect(state).toEqual(initialState);
  });

  it('should handle orderSuccess', () => {
    const state = reducer(initialState, orderSuccess(mockOrder));
    
    expect(state.order).toEqual(mockOrder);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle submitOrder.pending', () => {
    const action = { type: submitOrder.pending.type };
    const state = reducer(initialState, action);
    
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle submitOrder.fulfilled', () => {
    const action = { 
      type: submitOrder.fulfilled.type, 
      payload: mockOrder 
    };
    const state = reducer(initialState, action);
    
    expect(state.loading).toBe(false);
    expect(state.order).toEqual(mockOrder);
    expect(state.error).toBeNull();
  });

  it('should handle submitOrder.rejected with string payload', () => {
    const errorMessage = 'Failed to create order';
    const action = { 
      type: submitOrder.rejected.type,
      payload: errorMessage
    };
    const state = reducer(initialState, action);
    
    expect(state.loading).toBe(false);
    expect(state.order).toBeNull();
    expect(state.error).toBe(errorMessage);
  });

  it('should handle submitOrder.rejected with error object', () => {
    const errorMessage = 'Failed to create order';
    const action = { 
      type: submitOrder.rejected.type,
      error: { message: errorMessage }
    };
    const state = reducer(initialState, action);
    
    expect(state.loading).toBe(false);
    expect(state.order).toBeNull();
    expect(state.error).toBe(errorMessage);
  });
}); 