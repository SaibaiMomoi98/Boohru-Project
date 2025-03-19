import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    cachePosts: {},
    cachePost: {},
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
        setCachePost: (state, action) => {
            state.cachePost = action.payload;
        },
        clearCache: (state) => {
            state.cachePosts = {};
        },
    },
});

export const { setCachePost ,setCachePosts, setCacheTags ,clearCache } = cacheSlice.actions;
export default cacheSlice.reducer;
