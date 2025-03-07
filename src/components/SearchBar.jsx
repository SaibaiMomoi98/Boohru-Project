"use client"
import React, {useEffect, useState} from 'react';
import {signToken, verifyToken} from "@/middleware/hash";
import {usePathname, useRouter, useSearchParams} from 'next/navigation'

const SearchBar = (props) => {
    const [searchTerm, setSearchTerm] = useState([]);
    const [arrValue, setArrValue] = useState([]);
    const [fectTags, setFectTags] = useState([]);
    const [prefStorage, setPrefStorage] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter()
    const pathname = usePathname()
    const [refreshed, setRefreshed] = useState(true);
    const [revised, setRevised] = useState({
        isTrue: false,
        whichIndex: 0,
    });

    const searchParams = useSearchParams()
    const s = searchParams.get("s")

    console.log(pathname)
    const fetchData = async () => {
        try {
            const filterEmptyStringArray = searchTerm.filter((item) => {
                return (item !== (undefined, null, ""));
            })
            let res;
            if (revised.isTrue) {
                res = await fetch(`/tags.json/?search=${encodeURIComponent(filterEmptyStringArray[revised.whichIndex])}&limit=10&orderBy=count&order=desc`);
            } else {
                res = await fetch(`/tags.json/?search=${encodeURIComponent(filterEmptyStringArray[filterEmptyStringArray.length - 1])}&limit=10&orderBy=count&order=desc`);
            }
            const json = await res.json();
            setFectTags(json);
        } catch (error) {
            console.log(error);
        }
    }

    const directToPostPage = () => {
        const encodedSearchTerm = searchTerm.map((item) => {
            return encodeURIComponent(item);
        });
        const querySearch = encodedSearchTerm.join("+");
        if (querySearch === ""){
            router.push(`/post?p=${1}`);
        }else{
        router.push(`/post?s=${querySearch}&p=${1}`)
        }
        if (pathname === "/post") {
           // window.location.reload();
           sessionStorage.removeItem("palakbapakkao");
        }
    }

    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
                func(...args);
            }, delay);
        };
    };


    useEffect(() => {
        if (searchTerm.length > 0) {
            debounce(fetchData(), 1500);
        }

            if (s) {
                console.log(s, "searchnya");
                // Decode the search parameter without replacing '+'
                const decodedSearch = decodeURIComponent(s);
                const array = decodedSearch.split(" ");
                setArrValue(array);
            }

    }, []);



    useEffect(() => {
        if (searchTerm.length > 0) {
            debounce(fetchData(), 1000);
        }
        if (sessionStorage.getItem("pref")) {
            const localCurrentStorage = sessionStorage.getItem("pref")
            const currentPrevStorage = verifyToken(localCurrentStorage)
            setPrefStorage(currentPrevStorage.tags);
        }
        if (arrValue.length === 0 && pathname === "/post" && prefStorage && refreshed) {
            setArrValue(prefStorage.split("+").map((item) => decodeURIComponent(item)));
        }
    }, [searchTerm]);

    useEffect(() => {
        setSearchTerm([]);
        setSearchTerm(arrValue);
    }, [arrValue]);

    const handleOnChange = (e) => {
        const value = e.target.value;
        const valueSplit = value.split(' ');
        setSearchTerm(valueSplit);
        setRefreshed(false);
        if (value === "") {
            setArrValue([])
        }
        const filterEmptyStringArray = valueSplit.filter((item) => {
            return (item !== (undefined, null, ""));
        })
        if (arrValue.length > 0 && arrValue.length === filterEmptyStringArray.length) {
            const hasChangedSearch = filterEmptyStringArray.some(term => {
                return !arrValue.includes(term)
            })
            let whichIndex = 0;
            const indexRevised = filterEmptyStringArray.map((term, index) => {
                if (!arrValue.includes(term)) {
                    whichIndex = index
                }
            });

            if (hasChangedSearch) {
                setRevised({
                    isTrue: true,
                    whichIndex,
                });
            }

        }

        setIsOpen(!!value);

    }

    const handleAddTags = (tag) => {
        const value = tag.name
        console.log(revised)
        if (revised.isTrue) {
            arrValue.splice(revised.whichIndex, 1)
        }
        setArrValue((prev) => [...prev, value]);
        setIsOpen(false)
    }

    const handleOnSubmit = (e) => {
        e.preventDefault();
        directToPostPage()
    }


    return (
        <div className="relative">
            <form className="max-w-md mx-auto" onSubmit={handleOnSubmit} autoComplete="off" >
                <label htmlFor="default-search"
                       className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg className="w-4 h-4 text-cherry-rush dark:text-pink-400" aria-hidden="true"
                             xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                  strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                        </svg>
                    </div>
                    <input type="search" id="default-search" onChange={handleOnChange}
                           className="block w-full p-4 ps-10 text-sm text-cherry-rush dark:text-pink-200 border rounded-lg border-cherry-rush focus:ring-pink-500 focus:border-pink-500 dark:bg-pink-900 dark:border-cedar-wood dark:focus:ring-soft-peach dark:placeholder-pink-200 dark:text-pink-200 dark:focus:ring-pink-500 dark:focus:border-red-500"
                           placeholder="Search Anything Here" value={searchTerm.join(" ")}/>
                    <button type="submit"
                            className={`text-peach-cream dark:text-pink-200 absolute end-2.5 bottom-2.5 bg-cherry-rush hover:bg-pink-800 focus:ring-4 focus:outline-none focus:ring-cherry-rush font-medium rounded-lg text-sm px-4 py-2 dark:bg-pink-500 dark:hover:bg-red-700 dark:focus:ring-red-800 max-sm:inline `}>Search
                    </button>
                </div>
            </form>
            {isOpen && fectTags.length > 0 ? (

                <div
                    className="absolute inset-0  mt-[60px] max-w-md mx-auto h-[21vh] overflow-auto bg-peach-cream text-cherry-rush dark:bg-pink-900 dark:text-pink-300 rounded-lg border-pink-300 focus:border-pink-300"
                >

                    {
                        fectTags?.map((el, index) => (
                            <div key={index}
                                 className="flex flex-row justify-between items-center ps-1 pe-2 hover:bg-pink-300 hover:text-black hover:cursor-pointer "
                                 onClick={() => handleAddTags(el)}>
                                <p>{el.name}</p>
                                <p>{el.count}</p>
                            </div>
                        ))

                    }
                </div>
            ) : (<></>)}
        </div>
    )
}

export default SearchBar;
