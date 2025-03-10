import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { setCookie, getCookie, deleteCookie } from '../utils/cookie';

export type TUser = {
  email: string;
  name: string;
};

type TAuthState = {
  user: TUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
};

type TLoginResponse = {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: TUser;
};

type TRegisterResponse = TLoginResponse;

type TLogoutResponse = {
  success: boolean;
  message: string;
};

type TTokenResponse = {
  success: boolean;
  accessToken: string;
  refreshToken: string;
};

type TUserResponse = {
  success: boolean;
  user: TUser;
};

type TLoginRequest = {
  email: string;
  password: string;
};

type TRegisterRequest = {
  email: string;
  password: string;
  name: string;
};

type TUpdateUserRequest = {
  email?: string;
  password?: string;
  name?: string;
};

const initialState: TAuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Helper function to handle token refresh
const refreshToken = async () => {
  try {
    const refreshToken = getCookie('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('https://norma.nomoreparties.space/api/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: refreshToken }),
    });

    const data: TTokenResponse = await response.json();

    if (!data.success) {
      throw new Error('Failed to refresh token');
    }

    // Save the new tokens
    setCookie('token', data.accessToken.split('Bearer ')[1]);
    setCookie('refreshToken', data.refreshToken);

    return data.accessToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

// Helper function for authenticated API requests with token refresh
const fetchWithRefresh = async (url: string, options: RequestInit) => {
  try {
    const token = getCookie('token');
    
    // Add token to headers if available
    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    let response = await fetch(url, options);
    
    // If unauthorized, try to refresh token and retry
    if (response.status === 401 || response.status === 403) {
      const newToken = await refreshToken();
      
      // Update headers with new token
      options.headers = {
        ...options.headers,
        Authorization: newToken,
      };
      
      // Retry the request
      response = await fetch(url, options);
    }

    return response;
  } catch (error) {
    console.error('Error in fetchWithRefresh:', error);
    throw error;
  }
};

// Login thunk
export const login = createAsyncThunk<TLoginResponse, TLoginRequest>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch('https://norma.nomoreparties.space/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!data.success) {
        return rejectWithValue(data.message || 'Login failed');
      }

      // Save tokens
      setCookie('token', data.accessToken.split('Bearer ')[1]);
      setCookie('refreshToken', data.refreshToken);

      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

// Register thunk
export const register = createAsyncThunk<TRegisterResponse, TRegisterRequest>(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch('https://norma.nomoreparties.space/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!data.success) {
        return rejectWithValue(data.message || 'Registration failed');
      }

      // Save tokens
      setCookie('token', data.accessToken.split('Bearer ')[1]);
      setCookie('refreshToken', data.refreshToken);

      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

// Logout thunk
export const logout = createAsyncThunk<TLogoutResponse>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = getCookie('refreshToken');
      
      if (!refreshToken) {
        return rejectWithValue('No refresh token available');
      }

      const response = await fetch('https://norma.nomoreparties.space/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: refreshToken }),
      });

      const data = await response.json();

      if (!data.success) {
        return rejectWithValue(data.message || 'Logout failed');
      }

      // Clear tokens
      deleteCookie('token');
      deleteCookie('refreshToken');

      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

// Get user thunk
export const getUser = createAsyncThunk<TUserResponse>(
  'auth/getUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithRefresh('https://norma.nomoreparties.space/api/auth/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!data.success) {
        return rejectWithValue(data.message || 'Failed to get user data');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

// Update user thunk
export const updateUser = createAsyncThunk<TUserResponse, TUpdateUserRequest>(
  'auth/updateUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetchWithRefresh('https://norma.nomoreparties.space/api/auth/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!data.success) {
        return rejectWithValue(data.message || 'Failed to update user data');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

// Check auth thunk - to be called on app initialization
export const checkAuth = createAsyncThunk<TUserResponse>(
  'auth/checkAuth',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Check if we have a token
      const token = getCookie('token');
      
      if (!token) {
        return rejectWithValue('No token available');
      }

      // Try to get user data
      return await dispatch(getUser()).unwrap();
    } catch (error) {
      return rejectWithValue('Authentication check failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get user
    builder
      .addCase(getUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update user
    builder
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Check auth
    builder
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
      });
  },
});

export const { resetError } = authSlice.actions;

export default authSlice.reducer; 