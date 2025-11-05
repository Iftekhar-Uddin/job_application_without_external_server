import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from "@/redux/authSlice/authSlice"
import jobReducer from "@/redux/jobSlice/jobSlice";

export const store = configureStore({
  reducer: {
    authReducer,
    jobReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;