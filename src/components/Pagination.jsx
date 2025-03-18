import React, {useEffect, useState} from "react";
import {signToken, verifyToken} from "@/middleware/hash";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
export function CircularPagination({pages}) {
    const [active, setActive] = useState(1);
        const router = useRouter();
const pathname = usePathname()
const searchParams = useSearchParams()
const s = searchParams.get("s");
const p = searchParams.get("p");

    useEffect(() => {
        if (p){
            setActive(Number(p))
        }
    }, [pages, p]);

    const changePagination = (page) => {
        setActive(page);
        router.push(`${pathname}?${s ? "s=" + encodeURIComponent(s) + "&" : ""}p=${page}`);
    };


    const renderPagination = () => {
        const pagination = [];
        const maxVisiblePages = 5; // Total number of visible page buttons
        let startPage = Math.max(1, active - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(pages, startPage + maxVisiblePages - 1);

        // Adjust startPage if there are not enough pages before it
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Add first page button
        if (startPage > 1) {
            pagination.push(
                <button
                    key={1}
                    onClick={() => changePagination(1)}
                    className={`inline-flex items-center px-4 py-2 text-sm font-semibold border border-cedar-wood dark:border-pink-300 hover:text-pink-900 ${active === 1 ? 'dark:bg-pink-500' : 'dark:bg-pink-800'} hover:bg-pink-400`}
                >
                    {1}
                </button>
            );
            if (startPage > 2) {
                pagination.push(<span key="ellipsis-start"
                                      className="inline-flex max-sm:hidden items-center px-4 py-2 text-sm font-semibold border border-cedar-wood dark:border-pink-300 hover:text-pink-900 dark:bg-pink-800">...</span>);
            }
        }

        // Add page buttons
        for (let i = startPage; i <= endPage; i++) {
            pagination.push(
                <button
                    key={i}
                    onClick={() => changePagination(i)}
                    className={`inline-flex items-center px-4 py-2 text-sm font-semibold border border-cedar-wood dark:border-pink-300 hover:text-pink-900 ${active === i ? 'bg-cedar-wood text-dawn-pink dark:bg-pink-500' : 'dark:bg-pink-800'} hover:bg-pink-400`}
                >
                    {i}
                </button>
            );
        }

        // Add last page button
        if (endPage < pages) {
            if (endPage < pages - 1) {
                pagination.push(<span
                    className="inline-flex items-center px-4 py-2 text-sm max-sm:hidden font-semibold border border-cedar-wood dark:border-pink-300 hover:text-pink-900 dark:bg-pink-800"
                    key="ellipsis-end">...</span>);
            }
            pagination.push(
                // <button key={pages} onClick={() => changePagination(pages)}>{pages}</button>
                <button
                    key={pages}
                    onClick={() => changePagination(pages)}
                    className={`inline-flex items-center px-4 py-2 text-sm font-semibold border  border-cedar-wood dark:border-pink-300 hover:text-pink-900 ${active === pages ? 'dark:bg-pink-500' : 'dark:bg-pink-800'} hover:bg-pink-400`}
                >
                    {pages}
                </button>
            );

        }

        return pagination;
    };


    return (
        <nav aria-label="Pagination"
             className="inline-flex -space-x-px rounded-md shadow-sm bg-soft-peach  text-cedar-wood dark:bg-pink-800 dark:text-pink-400">
            <button type="button"
                    className="inline-flex items-center px-2 py-2 text-sm font-semibold border rounded-l-md border-cedar-wood dark:border-pink-300 hover:bg-pink-400 hover:text-pink-800">
                <span className="sr-only">Previous</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
                     className="w-5 h-5">
                    <path fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"></path>
                </svg>
            </button>
            {/*<button type="button" aria-current="page" className="inline-flex items-center px-4 py-2 text-sm font-semibold border dark:bg-violet-600 dark:text-gray-50 dark:border-gray-300">1</button>*/}
            {
                renderPagination()
            }
            <button type="button"
                    className="inline-flex items-center px-2 py-2 text-sm font-semibold border rounded-r-md border-cedar-wood dark:border-pink-300 hover:bg-pink-400 hover:text-pink-800">
                <span className="sr-only">Next</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
                     className="w-5 h-5">
                    <path fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"></path>
                </svg>
            </button>
        </nav>
    );
}