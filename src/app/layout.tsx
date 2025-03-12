import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import NavbarComponents from "@/components/NavbarComponents";
import ThemeProvider from "@/components/ThemeProvider";
import {StoreProvider} from "@/app/StoreProvider";


const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "BOOHRU",
    description: "WHAT!",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <StoreProvider>

        <html lang="en">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased `}
        >
        <ThemeProvider>
            <div  className="bg-peach-cream dark:bg-pink-800 h-auto w-full" >

                <NavbarComponents/>
                {children}
                <footer>INI FOOTER</footer>
            </div>
        </ThemeProvider>
        </body>
        </html>
        </StoreProvider>
    );
}
