import { BASE_URL, INGREDIENTS_ENDPOINT, ORDERS_ENDPOINT } from './constants';
import { getCookie } from './cookie';

export const checkResponse = (res: Response) => {
  return res.ok ? res.json() : res.json().then((err) => Promise.reject(err));
};

export const getIngredients = () => {
  return fetch(`${BASE_URL}${INGREDIENTS_ENDPOINT}`)
    .then(checkResponse);
};

export const createOrder = (ingredients: string[]) => {
  const token = getCookie('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(`${BASE_URL}${ORDERS_ENDPOINT}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ ingredients }),
  })
    .then(checkResponse);
};

// Get order details by number
export const getOrderDetails = (number: string) => {
  return fetch(`${BASE_URL}${ORDERS_ENDPOINT}/${number}`)
    .then(checkResponse);
}; 