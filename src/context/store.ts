// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import studentReducer from './student/studentSlice';
import authReducer from './auth/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    student: studentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
