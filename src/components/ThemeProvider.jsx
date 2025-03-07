// ThemeContext.js
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { signToken, verifyToken } from "@/middleware/hash";

const ThemeContext = createContext();

export const useTheme = () => {
    return useContext(ThemeContext);
};

const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState("light");
    const [prefStorage, setPrefStorage] = useState({ rating: "safe" });

    useEffect(() => {
        const prefData = sessionStorage.getItem("pref");
        if (prefData) {
            const decodedPref = verifyToken(prefData);
            setPrefStorage(decodedPref);
            setTheme(decodedPref.rating === "nsfw" ? "dark" : "light");
            console.log(decodedPref, "pref dari theme")
        } else {
            const defaultPref = { rating: "safe" , limit: 20 };
            setPrefStorage(defaultPref);
            sessionStorage.setItem("pref", signToken(defaultPref));
        }
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        document.body.classList.toggle("dark", theme === "dark");
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        const newRating = newTheme === "dark" ? "nsfw" : "safe";
        const newPref = { rating: newRating };
        setPrefStorage(newPref);
        sessionStorage.setItem("pref", signToken(newPref));
    };

    return (
        <ThemeContext.Provider value={{ theme, prefStorage, toggleTheme }} data-theme={theme}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;
