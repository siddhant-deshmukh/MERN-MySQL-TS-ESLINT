export interface IProduct {
  _id: string; // MongoDB ObjectId will be a string in frontend
  name: string;
  price: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

// Define the User Interface (from MySQL)
export interface IUser {
  id: number;
  username: string;
}

export type IAuthUser = IUser | null;

export interface IOrder {
  _id: string; // MongoDB ObjectId will be a string in frontend
  userId: number;
  productIds: IProduct[]; // Array of populated product objects
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  user: IUser; // Populated user object
}

export interface IRate {
  currency: string,
  rate: number
}
export interface IExchangeRates {
  rates: IRate[],
  date: Date
}