import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Session } from 'next-auth';

interface SessionState {
    session: Session | null
};

const initialState: SessionState = {
    session: null,
};

export const sessionSlice = createSlice({
    name: "session",
    initialState,
    reducers: {
        logOut: () => { initialState },
        setSession: (state, action: PayloadAction<Session | null>) => {
            state.session = action.payload;
        },
        clearSession: (state) => {
            state.session = null;
        },
    },
});

export const { setSession, clearSession, logOut } = sessionSlice.actions;
export default sessionSlice.reducer;




// interface User  {
//     id: string,
//     name: string,
//     email: string,
//     image: string,
//     role: string,
//     isTwoFactorEnabled: boolean
// };