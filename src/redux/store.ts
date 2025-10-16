import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from "@/redux/slices/authSlice"

export const store = configureStore({
  reducer: {
    authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;