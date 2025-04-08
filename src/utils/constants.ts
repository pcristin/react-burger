// API endpoints
export const BASE_URL = 'https://norma.nomoreparties.space/api';

// API routes
export const INGREDIENTS_ENDPOINT = '/ingredients';
export const ORDERS_ENDPOINT = '/orders';
export const AUTH_ENDPOINT = '/auth';
export const PASSWORD_RESET_ENDPOINT = '/password-reset';

// Auth-related endpoints
export const LOGIN_ENDPOINT = `${AUTH_ENDPOINT}/login`;
export const REGISTER_ENDPOINT = `${AUTH_ENDPOINT}/register`;
export const LOGOUT_ENDPOINT = `${AUTH_ENDPOINT}/logout`;
export const TOKEN_ENDPOINT = `${AUTH_ENDPOINT}/token`;
export const USER_ENDPOINT = `${AUTH_ENDPOINT}/user`;

// Password reset endpoints
export const RESET_PASSWORD_ENDPOINT = `${PASSWORD_RESET_ENDPOINT}/reset`; 