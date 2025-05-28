// src/redux/slices/userSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type IUser } from '../../types/index'; // Assuming IUser is defined in src/types/index.ts

interface UserState {
  authUser: IUser | null;
}

const initialState: UserState = {
  authUser: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAuthUser: (state, action: PayloadAction<IUser>) => {
      state.authUser = action.payload;
    },
    clearAuthUser: (state) => {
      state.authUser = null;
    },
  },
});

export const { setAuthUser, clearAuthUser } = userSlice.actions;
export default userSlice.reducer;
