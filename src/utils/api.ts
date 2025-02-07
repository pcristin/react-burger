const API_URL = 'https://norma.nomoreparties.space/api';

export const checkResponse = (res: Response) => {
  return res.ok ? res.json() : res.json().then((err) => Promise.reject(err));
};

export const getIngredients = () => {
  return fetch(`${API_URL}/ingredients`)
    .then(checkResponse);
};

export const createOrder = (ingredients: string[]) => {
  return fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ingredients }),
  })
    .then(checkResponse);
}; 