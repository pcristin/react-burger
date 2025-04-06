export type TIngredient = {
  _id: string;
  name: string;
  type: 'bun' | 'sauce' | 'main';
  proteins: number;
  fat: number;
  carbohydrates: number;
  calories: number;
  price: number;
  image: string;
  image_mobile: string;
  image_large: string;
  __v: number;
};

export type TConstructorIngredient = TIngredient & {
  uniqueId: string;
};

export type TOrder = {
  number: number;
  name?: string;
  ingredients?: string[];
  status?: 'created' | 'pending' | 'done';
  createdAt?: string;
  updatedAt?: string;
  _id?: string;
};

// Updated detailed order type for feed
export type TOrderFeed = {
  _id: string;
  ingredients: string[];
  status: 'created' | 'pending' | 'done';
  name: string;
  number: number;
  createdAt: string;
  updatedAt: string;
};

// Feed data responses
export type TAllOrdersResponse = {
  success: boolean;
  orders: TOrderFeed[];
  total: number;
  totalToday: number;
};

export type TOrderDetailsResponse = {
  success: boolean;
  orders: TOrderFeed[];
};

export type TIngredientsState = {
  items: TIngredient[];
  loading: boolean;
  error: string | null;
};

export type TConstructorState = {
  bun: TIngredient | null;
  ingredients: TConstructorIngredient[];
};

export type TCurrentIngredientState = {
  ingredient: TIngredient | null;
};

export type TOrderState = {
  order: TOrder | null;
  loading: boolean;
  error: string | null;
};

// New state types for order feed
export type TOrderFeedState = {
  orders: TOrderFeed[];
  total: number;
  totalToday: number;
  loading: boolean;
  error: string | null;
};

export type TUserOrdersState = {
  orders: TOrderFeed[];
  total: number;
  totalToday: number;
  loading: boolean;
  error: string | null;
};

export type TCurrentOrderState = {
  order: TOrderFeed | null;
  loading: boolean;
  error: string | null;
}; 