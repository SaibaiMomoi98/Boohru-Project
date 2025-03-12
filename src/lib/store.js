import {combineReducers, configureStore} from "@reduxjs/toolkit";
import cacheReducer from "./cacheSlice/cacheSlice"

const rootReducer = combineReducers({cache: cacheReducer})

export const makeStore = () => {
    return configureStore({
        reducer: rootReducer
    });
};
