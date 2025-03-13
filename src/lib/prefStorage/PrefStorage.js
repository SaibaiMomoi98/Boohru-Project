import {createSlice} from "@reduxjs/toolkit";
import {signToken, verifyToken} from "../../middleware/hash";

const initialState = {
    prefStorage: {},
}

const prefStorageSlice = createSlice({
    name: "prefStorage",
    initialState,
    reducers: {
        setPrefStorage: (state, action) => {
            const payload = verifyToken(action.payload);
            state.prefStorage = payload;
        },
        setPrefStorageRaw: (state, action) => {
            state.prefStorage = action.payload;
            const stringPrev = signToken(action.payload);
            sessionStorage.setItem("pref", stringPrev);
        }

    }
})

export const {setPrefStorage, setPrefStorageRaw} = prefStorageSlice.actions;
export default prefStorageSlice.reducer;