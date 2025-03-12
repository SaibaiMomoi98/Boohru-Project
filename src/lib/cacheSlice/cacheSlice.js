import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    cachePosts: {},
    cacheTags : {},
};

const cacheSlice = createSlice({
    name: "cache",
    initialState,
    reducers: {
        setCachePosts: (state, action) => {
            state.cachePosts = action.payload;
        },
        setCacheTags: (state, action) => {
            state.cacheTags = action.payload;
        },
        clearCache: (state) => {
            state.cachePosts = {};
        },
    },
});

export const { setCachePosts, setCacheTags ,clearCache } = cacheSlice.actions;
export default cacheSlice.reducer;
