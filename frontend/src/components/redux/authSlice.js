import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { loading: false, user: null },
  reducers: {
    setLoading: (state, action) => { state.loading = action.payload; },
    setAuthUser: (state, action) => { state.user = action.payload; },
    logout: (state) => {
      state.user = null;
      state.loading = false;
    },
  },
});

export const { setLoading, setAuthUser, logout } = authSlice.actions;
export default authSlice.reducer;
