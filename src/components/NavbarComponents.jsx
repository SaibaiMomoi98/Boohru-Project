"use client"
import React from 'react';
import {UserProfile} from "@/components/UserProfile";
import BurgerMenu from "@/components/burgerMenu";



function NavbarComponents(props) {

    return (
        <div className="flex flex-row justify-between bg-pink-800 ps-5 pe-5 pt-2">
            <div className="flex flex-row items-center gap-2">
                <BurgerMenu/>

                <div>
                    BOOHRU-CHAN! LOGO
                </div>
            </div>
            <div className="mt-2">
                <UserProfile/>
            </div>
        </div>
    );
}

export default NavbarComponents;