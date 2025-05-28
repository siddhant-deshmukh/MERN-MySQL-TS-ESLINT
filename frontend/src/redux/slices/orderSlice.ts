// src/redux/slices/ordersSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IOrder } from '../../types'; // Assuming IOrder is defined in src/types/index.ts

interface OrdersState {
  orders: IOrder[];
}

const initialState: OrdersState = {
  orders: [],
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<IOrder[]>) => {
      state.orders = action.payload;
    },
    addOrder: (state, action: PayloadAction<IOrder>) => {
      state.orders.push(action.payload);
    },
    updateOrder: (state, action: PayloadAction<IOrder>) => {
      const index = state.orders.findIndex(order => order._id === action.payload._id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    },
    deleteOrder: (state, action: PayloadAction<string>) => {
      state.orders = state.orders.filter(order => order._id !== action.payload);
    },
  },
});

export const { setOrders, addOrder, updateOrder, deleteOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
