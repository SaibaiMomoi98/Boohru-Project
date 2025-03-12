"use client"
import React, {useState} from 'react';
import {useRouter} from "next/navigation";


function Page(props) {
        const router = useRouter()
    const [login, setLogin] = useState(false);

    const toMoreSettings = () => {
        router.push('/settings/content');
    }

    return (
        <div className="h-[100vh] flex justify-center items-start">
            <div className="flex flex-col items-start justify-center h-full ">

            {
                login ? (
                    <div>
                        User Profile Settings
                    </div>
                ) : (
                    <>
                        <div className="hover:cursor-pointer bg-pink-700 p-5 rounded-lg ">
                            Login
                        </div>
                        <div className="hover:cursor-pointer bg-pink-700 p-5 rounded-lg " >
                            Sign Up
                        </div>
                        <div className="hover:cursor-pointer bg-pink-700 p-5 rounded-lg " onClick={() => toMoreSettings()}>
                            <h1>More Options</h1>
                            <p>set content filter</p>
                        </div>
                    </>
                )
            }
            </div>
        </div>
    );
}

export default Page;