import React from "react";
import { useRouter } from "next/navigation";

// Profile menu component
const profileMenuItems = [
    { label: "My Profile" },
    { label: "Settings" },
    { label: "Inbox" },
    { label: "Help" },
    { label: "Sign Out" },
];

const profileMenuItems2 = [
    { label: "Sign in" },
    { label: "Login" },
    { label: "Settings" },
    { label: "Help" },
];

export function UserProfile() {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [login, setLogin] = React.useState(false);

    const closeMenu = (label) => {
        if (label === "Settings") {
            router.push('/settings');
        }
        setIsMenuOpen(false);
    };

    const menuListItems = () => {
        const items = login ? profileMenuItems : profileMenuItems2;
        return items.map(({ label }, key) => {
            const isLastItem = key === items.length - 1;
            return (
                <div
                    key={label}
                    onClick={() => closeMenu(label)}
                    className={`flex items-center gap-2 rounded p-2 cursor-pointer ${
                        isLastItem ? "text-red-500" : ""
                    } hover:bg-gray-200`}
                >
                    <span>{label}</span>
                </div>
            );
        });
    };

    return (
        <div className="relative">
            <div>
                {login ? (
                    <button
                        className="flex items-center rounded-full p-2 bg-gray-300"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <img
                            src="https://via.placeholder.com/40" // Placeholder for avatar
                            alt="profile"
                            className="rounded-full"
                        />
                    </button>
                ) : (
                    <button
                        className="flex items-center rounded-full p-2 bg-gray-300"
                        onClick={() => setLogin(true)} // Simulate login
                    >
                        Login
                    </button>
                )}
            </div>
            {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                    {menuListItems()}
                </div>
            )}
        </div>
    );
}
