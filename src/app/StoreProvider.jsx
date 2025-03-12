"use client";
import {makeStore, persistor} from "@/lib/store";
import { setupListeners } from "@reduxjs/toolkit/query";
import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import {PersistGate} from "redux-persist/integration/react";

export const StoreProvider = ({ children }) => {
    const storeRef = useRef(null);

    if (!storeRef.current) {
        storeRef.current = makeStore();
    }

    useEffect(() => {
        if (storeRef.current) {
            const unsubscribe = setupListeners(storeRef.current.dispatch);
            return unsubscribe;
        }
    }, []);

    return <Provider store={storeRef.current}> {children} </Provider>;
};
