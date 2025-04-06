import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { setCookie, getCookie, deleteCookie } from '../utils/cookie';
import { BASE_URL, TOKEN_ENDPOINT, LOGIN_ENDPOINT, REGISTER_ENDPOINT, LOGOUT_ENDPOINT, USER_ENDPOINT } from '../utils/constants';

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

    console.log('Attempting to refresh token');
    const response = await fetch(`${BASE_URL}${TOKEN_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: refreshToken }),
    });

    const data: TTokenResponse = await response.json();

    if (!data.success) {
      console.error('API reported token refresh failure:', data);
      throw new Error('Failed to refresh token');
    }

    console.log('Token refreshed successfully');
    // Save the new tokens
    setCookie('token', data.accessToken.split('Bearer ')[1]);
    setCookie('refreshToken', data.refreshToken);

    return data.accessToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    // Clear tokens on refresh failure
    deleteCookie('token');
    deleteCookie('refreshToken');
    throw error;
  }
};

// Helper function for authenticated API requests with token refresh
const fetchWithRefresh = async (url: string, options: RequestInit, retryCount = 0) => {
  const MAX_RETRIES = 2;
  
  try {
    const token = getCookie('token');
    
    // Add token to headers if available
    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    // If we're retrying, add some delay to avoid rate limiting
    if (retryCount > 0) {
      await new Promise(resolve => setTimeout(resolve, retryCount * 1500));
    }

    let response = await fetch(url, options);
    
    // Handle rate limit (429) errors
    if (response.status === 429) {
      console.warn(`Rate limit hit (429). Retry count: ${retryCount}/${MAX_RETRIES}`);
      
      if (retryCount < MAX_RETRIES) {
        // Wait longer for rate limit errors
        await new Promise(resolve => setTimeout(resolve, 2000 + retryCount * 1000));
        return fetchWithRefresh(url, options, retryCount + 1);
      } else {
        throw new Error('Rate limit exceeded after maximum retries');
      }
    }
    
    // If unauthorized, try to refresh token and retry
    if (response.status === 401 || response.status === 403) {
      // Only attempt token refresh if we haven't tried too many times
      if (retryCount < MAX_RETRIES) {
        console.log('Auth token expired, attempting refresh');
        try {
          const newToken = await refreshToken();
          
          // Update headers with new token
          options.headers = {
            ...options.headers,
            Authorization: newToken,
          };
          
          // Retry the request with new token
          return fetchWithRefresh(url, options, retryCount + 1);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          throw new Error('Authentication failed after token refresh attempt');
        }
      } else {
        throw new Error('Authentication failed after maximum retries');
      }
    }

    return response;
  } catch (error: unknown) {
    console.error('Error in fetchWithRefresh:', error);
    // Add retry info to the error for better debugging
    const errorMessage = error instanceof Error ? error.message : String(error);
    const enhancedError = new Error(
      `API request failed (attempt ${retryCount + 1}/${MAX_RETRIES + 1}): ${errorMessage}`
    );
    throw enhancedError;
  }
};

// Login thunk
export const login = createAsyncThunk<TLoginResponse, TLoginRequest>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('Attempting login with credentials:', { email: credentials.email, password: '***' });
      
      const response = await fetch(`${BASE_URL}${LOGIN_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!data.success) {
        console.error('API reported login failure:', data);
        return rejectWithValue(data.message || 'Login failed');
      }

      console.log('Login successful, setting cookies');
      // Save tokens
      setCookie('token', data.accessToken.split('Bearer ')[1]);
      setCookie('refreshToken', data.refreshToken);

      return data;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      return rejectWithValue(errorMessage);
    }
  }
);

// Register thunk
export const register = createAsyncThunk<TRegisterResponse, TRegisterRequest>(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}${REGISTER_ENDPOINT}`, {
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

      const response = await fetch(`${BASE_URL}${LOGOUT_ENDPOINT}`, {
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
      const response = await fetchWithRefresh(`${BASE_URL}${USER_ENDPOINT}`, {
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
      const response = await fetchWithRefresh(`${BASE_URL}${USER_ENDPOINT}`, {
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