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
  name: string;
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