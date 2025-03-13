import {combineReducers, configureStore} from "@reduxjs/toolkit";
import cacheReducer from "./cacheSlice/cacheSlice"
import prefStorageReducer from "./prefStorage/PrefStorage"

const rootReducer = combineReducers({cache: cacheReducer, pref: prefStorageReducer})

export const makeStore = () => {
    return configureStore({
        reducer: rootReducer
    });
};
