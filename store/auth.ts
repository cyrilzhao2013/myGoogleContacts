import { createSlice } from "@reduxjs/toolkit";
import { AppState } from "./index";
import { HYDRATE } from "next-redux-wrapper";

// Type for our state
export interface AuthState {
  googleApiScriptLoaded: boolean;
  authorized: boolean;
}

// Initial state
const initialState: AuthState = {
  googleApiScriptLoaded: false,
  authorized: false,
};

// Actual Slice
export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Action to set the authentication status
    setGoogleApiScriptLoaded(state, action) {
      state.googleApiScriptLoaded = action.payload;
    },
    setAuthorized(state, action) {
      state.authorized = action.payload;
    },
  },

  // Special reducer for hydrating the state. Special case for next-redux-wrapper
  extraReducers: {
    [HYDRATE]: (state, action) => {
      return {
        ...state,
        ...action.payload.auth,
      };
    },
  },
});

export const { setAuthorized, setGoogleApiScriptLoaded } = authSlice.actions;

export const selectGoogleApiScriptLoaded = (state: AppState) =>
  state.auth.googleApiScriptLoaded;

export const selectAuthorized = (state: AppState) => state.auth.authorized;

export default authSlice.reducer;
