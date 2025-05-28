// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice'; // Updated import for userSlice
import productsReducer from './slices/productSlice'; // Assuming you have this
import ordersReducer from './slices/orderSlice';     // Assuming you have this

export const store = configureStore({
  reducer: {
    user: userReducer, // Updated slice name
    products: productsReducer,
    orders: ordersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
