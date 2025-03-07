import React from 'react';
import Link from "next/link";
import {useRouter} from "next/navigation";
const { useState } = React;

const BurgerMenu = (props) => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const genericHamburgerLine = `h-1 w-6 my-1 rounded-full bg-pink-500 transition ease transform duration-300`;

    const  changePage = (page) => {
        router.push(page);
        setIsOpen(false);
    }
    return(
        <div>

        <button
            className="flex flex-col h-12 w-12 border-2 border-peach-cream dark:border-pink-800 rounded justify-center items-center group"
            onClick={() => setIsOpen(!isOpen)}
        >
            <div
                className={`${genericHamburgerLine} ${
                    isOpen
                        ? "rotate-45 translate-y-3 group-hover:opacity-100 "
                        : ""
                }`}
            />
            <div
                className={`${genericHamburgerLine} ${
                    isOpen ? "opacity-0" : ""
                }`}
            />
            <div
                className={`${genericHamburgerLine} ${
                    isOpen
                        ? "-rotate-45 -translate-y-3 group-hover:opacity-100 "
                        : ""
                }`}
            />
        </button>
            {isOpen ? (
            <div className="absolute w-[25vh] h-[20vh] p-[12vh] z-10 border-cherry-rush bg-peach-cream dark:bg-pink-800 dark:border-soft-peach border-2 rounded-lg
            max-sm:w-[90%]
            ">
                <div className="w-[100%] h-[100%] bg-peach-cream text-cherry-rush dark:bg-soft-peach dark:text-soft-peach rounded-lg flex flex-col items-center justify-center gap-[1.5vh]">
                    <button onClick={() => changePage('/post')} >Posts</button>
                    <button onClick={() => changePage('/')}>Home</button>
                    <a>Tags</a>
                    <a>Random</a>
                </div>
            </div>
            ): (<></>)}
        </div>

    )

}

export default BurgerMenu;