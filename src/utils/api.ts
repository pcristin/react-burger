export const NORMA_API = 'https://norma.nomoreparties.space/api';

export const checkResponse = (res: Response) => {
  if (res.ok) {
    return res.json();
  }
  return Promise.reject(`Ошибка: ${res.status}`);
};

export const request = async (endpoint: string, options?: RequestInit) => {
  const res = await fetch(`${NORMA_API}${endpoint}`, options);
  return checkResponse(res);
}; 