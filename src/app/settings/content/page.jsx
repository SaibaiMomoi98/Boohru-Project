"use client";
import React, { useEffect, useState } from 'react';
import { signToken, verifyToken } from "../../../middleware/hash";

function Page(props) {
    // State to manage the theme
    const [prefStorage, setPrefStorage] = useState({});
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Function to set preferences in session storage
    const setPrefFunc = (obj) => {
        const data = signToken(obj);
        sessionStorage.setItem("pref", data);
        setPrefStorage(obj);
    };

    useEffect(() => {
        const pref = sessionStorage.getItem('pref');
        if (pref) {
            const decodedPref = verifyToken(pref);
            if (decodedPref.rating === "nsfw") {
                setPrefStorage(decodedPref);
                setIsDarkMode(decodedPref.rating === "nsfw");
            } else if(decodedPref.rating === "safe") {
                const dataDefault = { rating: "safe"}
            }
        } else {
            const dataDefault = { rating: "safe"};
            setPrefFunc(dataDefault);
        }
    }, []);


    useEffect(() => {
        console.log(isDarkMode, "darkmode");

    }, [isDarkMode]);

    useEffect(() => {
        // Update the body class based on the current rating
        if (prefStorage.rating === "nsfw") {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }, [prefStorage]);

    useEffect(() => {
        const newRating = isDarkMode ? "nsfw" : "safe";
        setPrefFunc({ rating: newRating , limit: 20});
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    return (
        <div className="flex flex-col items-center gap-2 h-[100vh] justify-center items-center">
            {prefStorage?.rating === "safe" ? (
                <h1 className="text-pink-800">
                    Want To Enable Nsfw Mode?
                </h1>
            ) : (
                <h1 className="text-pink-300">
                    Nsfw Mode Enabled 😏
                </h1>
            )}
            <label htmlFor="Toggle4"
                   className="inline-flex items-center p-1 cursor-pointer bg-gray-700 dark:bg-gray-700 dark:text-gray-100">
                <input
                    id="Toggle4"
                    type="checkbox"
                    className="hidden peer"
                    checked={isDarkMode}
                    onChange={toggleTheme}
                />
                <span className="px-4 py-2 bg-pink-500 dark:bg-gray-400 peer-checked:dark:bg-gray-700">OFF</span>
                <span className="px-4 py-2 dark:bg-gray-700 peer-checked:dark:bg-pink-800">ON</span>
            </label>
        </div>
    );
}

export default Page;
