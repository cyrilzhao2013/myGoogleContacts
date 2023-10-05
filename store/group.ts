import { createSlice } from "@reduxjs/toolkit";
import { AppState } from "./index";
import { HYDRATE } from "next-redux-wrapper";
import { Group } from "@/modules/Group";

// Type for our state
export interface GroupState {
  customGroups: Group[];
}

// Initial state
const initialState: GroupState = {
  customGroups: [],
};

// Actual Slice
export const groupSlice = createSlice({
  name: "group",
  initialState,
  reducers: {
    // Action to set the authentication status
    setCustomGroups(state, action) {
      state.customGroups = action.payload;
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

export const { setCustomGroups } = groupSlice.actions;

export const selectCustomGroups = (state: AppState) => state.group.customGroups;

export default groupSlice.reducer;
