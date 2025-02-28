import React from 'react';
const { useState } = React;

const BurgerMenu = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const genericHamburgerLine = `h-1 w-6 my-1 rounded-full bg-pink-500 transition ease transform duration-300`;

    return(
        <div>

        <button
            className="flex flex-col h-12 w-12 border-2 border-pink-800 rounded justify-center items-center group"
            onClick={() => setIsOpen(!isOpen)}
        >
            <div
                className={`${genericHamburgerLine} ${
                    isOpen
                        ? "rotate-45 translate-y-3 group-hover:opacity-100 group-hover:bg-pink-300"
                        : "group-hover:bg-pink-300"
                }`}
            />
            <div
                className={`${genericHamburgerLine} ${
                    isOpen ? "opacity-0" : "group-hover:bg-pink-300"
                }`}
            />
            <div
                className={`${genericHamburgerLine} ${
                    isOpen
                        ? "-rotate-45 -translate-y-3 group-hover:opacity-100 group-hover:bg-pink-300"
                        : "group-hover:bg-pink-300"
                }`}
            />
        </button>
            {isOpen ? (
            <div className="absolute w-[25vh] h-[20vh] bg-white">
                <div className="w-[100%] h-[100%] bg-pink-500 rounded-lg">

                </div>
            </div>
            ): (<></>)}
        </div>

    )

}

export default BurgerMenu;