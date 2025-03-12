"use client"
import React from 'react';
import {UserProfile} from "@/components/UserProfile";
import BurgerMenu from "@/components/burgerMenu";
import Link from "next/link";



function NavbarComponents(props) {

    return (
        <div className="flex flex-row justify-between items-center bg-peach-cream dark:bg-pink-800 ps-5 pe-5 pt-2">
            <div className="flex flex-row items-center gap-2 pb-2">
                <BurgerMenu/>

                <Link href="/">
                    BOOHRU-CHAN! LOGO
                </Link>
            </div>
            <div className="pb-2">
                <UserProfile/>
            </div>
        </div>
    );
}

export default NavbarComponents;