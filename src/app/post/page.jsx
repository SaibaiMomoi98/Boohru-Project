"use client"
import React, {useEffect, useState} from 'react';
import SearchBar from "../../components/SearchBar";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {signToken, verifyToken} from "../../middleware/hash";
import Image from 'next/image'
import {CircularPagination} from "@/components/Pagination";
import LoadingComp from "@/components/LoadingComp";
import {fetchTags} from "@/Helper/FetchTags";
import RenderTags from "@/components/RenderTags";
import {FetchPosts} from "@/Helper/FetchPost";
import {useDispatch, useSelector} from "react-redux";
import {setCachePosts, setCacheTags} from "@/lib/cacheSlice/cacheSlice";
import {encodeHtmlEntity} from "@/Helper/encodeDecodeHtmlTags";
import {setPrefStorage, setPrefStorageRaw} from "@/lib/prefStorage/PrefStorage";

const Page = () => {
    const dispatch = useDispatch();
    const {cachePosts, cacheTags} = useSelector((state) => state.cache);
    const {prefStorage} = useSelector((state) => state.pref);
    const searchParams = useSearchParams()
    const router = useRouter();
    const pathname = usePathname()
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 0,
    });
    const [posts, setPosts] = useState({})
    const [relativeTags, setRelativeTags] = useState({
        creator: [],
        character: [],
        from: [],
        genre: []
    })

    const s = searchParams.get("s");
    const p = searchParams.get("p");

    useEffect(() => {
        setPrefStorageFunc();
    }, []);


    function getSessionStorageSize() {
        if (window !== undefined) {
            const windowSession = window.sessionStorage
            let total = 0;
            for (let key in windowSession) {
                if (sessionStorage.hasOwnProperty(key)) {
                    total += sessionStorage[key].length * 2; // Each character is 2 bytes (UTF-16)
                }
            }
            return total; // Size in bytes
        }
    }


    useEffect(() => {
        const sizeInBytes = getSessionStorageSize();
        const sizeInMB = sizeInBytes / (1024 * 1024); // Convert to MB
        console.log(`sessionStorage size: ${sizeInMB.toFixed(2)} MB`);

        const cacheRaw = sessionStorage.getItem("c");
        const shouldFetch = prefStorage.limit !== undefined && prefStorage.rating !== undefined;
        const cacheId = sessionStorage.getItem("ci");
        if (cacheRaw) {
            if (cacheId) {
                const dataCacheId = verifyToken(cacheId);
                console.log(dataCacheId, " cache id");
                if (Number(dataCacheId.currentPage) !== Number(p)) {
                    const dataObjCacheId = {currentPage: Number(p), search: dataCacheId.search};
                    console.log(dataObjCacheId, "cache obj");
                    const stringObj = signToken(dataObjCacheId)
                    sessionStorage.setItem("ci", stringObj)
                }
            }
            setLoading(true);
            const cache = verifyToken(cacheRaw);

            console.log(cache)
            const ratingKey = prefStorage.rating; // e.g., "safe" or "nsfw"
            const searchKey = encodeHtmlEntity(s); // Encode the search term
            const searchCacheData = cache[ratingKey]?.[searchKey]; // Get cache for the current rating and search term
            if (searchCacheData) {

                const searchCache = Object.keys(cache[ratingKey]).find((key, index) => key === s);
                const cachePageKeys = searchCacheData.cache.map((entry) => Object.keys(entry)[0]).find((key) => Number(key) === Number(p));

                const currentPageCache = searchCacheData.cache.find((entry) => {
                    const pageKey = Object.keys(entry)[0];
                    return pageKey === p;
                });
                // console.log(cachePageKeys, "cache data")
                // console.log(Object.keys(currentPageCache)[0],"cache data")
                // console.log(Object.keys(cache[ratingKey]).filter((el,index) => el !== "iat"))
                // console.log(Object.keys(cache[ratingKey]).filter((el,index) => el !== "iat").length, "length inich")



                console.log(Number(cachePageKeys) !== Number(p) && shouldFetch || s !== searchKey && shouldFetch, "masuk fetch");

                if (Number(cachePageKeys) !== Number(p) && shouldFetch || s !== searchKey && shouldFetch) {
                    fetchPosts(); // Fetch new data if the page or search term has changed
                } else {
                    if (currentPageCache) {
                        const {data, tags} = Object.values(currentPageCache)[0]; // Extract data and tags
                        if (data.status || tags.status || tags.creator.length === 0 || tags.character.length === 0 || data.post.length === 0) {
                            sessionStorage.removeItem("c")
                        }
                        console.log("masuk cache");
                        setPosts(data);
                        setRelativeTags(tags);
                        setPagination(prev => ({...prev, totalPages: searchCacheData.pages}));
                        dispatch(setCachePosts(data));
                    }
                    setLoading(false);
                }
            } else if (shouldFetch) {
                fetchPosts();
            }
        } else if (shouldFetch) {
            fetchPosts();
        }
    }, [s, pagination.currentPage, prefStorage.limit, prefStorage.rating]);

    useEffect(() => {
        if (p) {
            setPagination(prev => ({...prev, currentPage: Number(p)}));
        }
    }, [searchParams]);


    const setPrefStorageFunc = () => {
        const pref = sessionStorage.getItem("pref");
        if (pref) {
            dispatch(setPrefStorage(pref));
        } else {
            const defaultObj = {rating: "safe", limit: 20};
            dispatch(setPrefStorageRaw(defaultObj))
        }
    };

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const { data, tags } = await FetchPosts(s, pagination, prefStorage, true);
            setPosts(data);
            setRelativeTags(tags);

            const cacheid = data?.post?.map(post => post.id) || [];
            dispatch(setCachePosts(cacheid));
            const attributes = data['@attributes'];
            let pages;
            if (attributes) {
                pages = Math.ceil(Number(attributes.count) / Number(attributes.limit));
                setPagination(prev => ({ ...prev, totalPages: pages }));
            }

            const existingCache = sessionStorage.getItem("c");
            let cache = existingCache ? verifyToken(existingCache) : {};

            const ratingKey = prefStorage.rating; // e.g., "safe" or "nsfw"
            const searchKey = s ? encodeHtmlEntity(s) : "notS";
            const pageKey = p || pagination.currentPage;

            // Initialize the rating key if it doesn't exist
            if (!cache[ratingKey]) {
                cache[ratingKey] = {};
            }

            const searchKeys = Object.keys(cache[ratingKey]);
            if (searchKeys.length >= 5) {
                const keysToRemove = searchKeys.slice(0, 2);
                keysToRemove.forEach(key => {
                    delete cache[ratingKey][key];
                });
                console.log("Removed the first 2 search keys because the limit of 5 was exceeded.");
            }

            if (!cache[ratingKey][searchKey]) {
                cache[ratingKey][searchKey] = {
                    pages,
                    cache: [
                        {
                            [pageKey]: { data, tags },
                        },
                    ],
                };
            } else {

                if (cache[ratingKey][searchKey].cache.length >= 10) {
                    cache[ratingKey][searchKey].cache.splice(0, 5);
                    console.log("Cache array cleared because it exceeded the limit of 10 entries.");
                }

                const pageExists = cache[ratingKey][searchKey].cache.some((entry) => entry[pageKey]);

                if (!pageExists) {
                    cache[ratingKey][searchKey].cache.push({
                        [pageKey]: { data, tags },
                    });
                } else {
                    const pageIndex = cache[ratingKey][searchKey].cache.findIndex((entry) => entry[pageKey]);
                    cache[ratingKey][searchKey].cache[pageIndex][pageKey] = { data, tags };
                }
            }

            // Update the ci cache
            const cachePostId = { currentPage: pagination.currentPage, search: prefStorage.search || s }
            const tokenIdCache = signToken(cachePostId);
            sessionStorage.setItem("ci", tokenIdCache);

            // Store the updated cache in sessionStorage
            const tokenCache = signToken(cache);
            sessionStorage.setItem("c", tokenCache);
        } catch (error) {
            sessionStorage.removeItem("c");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    const goToPostDetails = (id) => {
        router.push(`/post/${id}${s ? "?s=" + encodeURIComponent(s) : ""}`);
    }

    const renderPosts = () => {
        const data = posts?.post?.map((post, index) => {
            return (
                <div key={index}
                     onClick={() => goToPostDetails(post.id)}
                     className={`md:w-[25vh] md:h-[15vhh] max-sm:w-[28vh] flex flex-row flex-wrap justify-center items-start rounded-lg hover:opacity-60 `}>
                    <Image
                        src={`${post?.preview_url}`}
                        width={post?.preview_width}
                        height={post?.preview_height}
                        alt="Picture of the author"
                        className="md:max-w-full h-auto max-sm:w-full"
                    />
                </div>)
        })
        return data
    }

    return (
        <>
            {
                loading ? (
                    <LoadingComp/>
                ) : (
                    <div className="w-full h-[100wh]">
                        <div
                            className="md:mt-[5vh] max-sm:gap-4 grid md:gap-y-4 md:ps-[2vh] md:grid-cols-[2fr_3.8fr_3fr] md:grid-rows-[0.1fr_3fr_1fr]">
                            <div className="md:order-1 md:row-start-1 md:col-start-1 md:col-end-4">
                                <SearchBar/>
                            </div>
                            <div className="order-4 md:order-1 md:row-start-2 md:row-end-4 md:col-start-1">
                                <div className="flex flex-row max-md:justify-center flex-wrap gap-2">
                                    <div className="flex flex-row flex-wrap gap-2 justify-center items-center">
                                        <div
                                            className="bg-green-400 h-[4vh] flex flex-row items-center rounded-lg p-1 text-center text-[10px] text-green-900">Artist
                                        </div>
                                        <div
                                            className="bg-cyan-400 h-[4vh] flex flex-row items-center rounded-lg p-1 text-center text-[10px] text-blue-900">Shows/Games
                                        </div>
                                        <div
                                            className="bg-red-400 h-[4vh] flex flex-row items-center rounded-lg p-1 text-center text-[10px] text-red-900">Characters
                                        </div>
                                        <div
                                            className="bg-pink-400 h-[4vh] flex flex-row items-center rounded-lg p-1 text-center text-[10px] text-pink-900">Genre
                                            & Other
                                        </div>
                                    </div>
                                    <div className="h-[2px] bg-pink-400 w-full my-4"></div>
                                    <RenderTags relativeTags={relativeTags}/>
                                </div>
                            </div>
                            <div
                                className="order-3 md:ps-[2vh] md:row-start-2 md:row-end-4 md:col-start-2 md:col-end-5 flex flex-wrap items-center justify-center md:justify-start gap-[10px] max-sm:mt-[4vh]">
                                {renderPosts()}
                            </div>
                            <div
                                className="order-3 md:col-start-1 md:col-end-4 md:row-start-4 md:row-end-5 max-md:mt-6 md:mb-10">
                                <div
                                    className="flex flex-row justify-center h-[6vh] items-center max-sm:justify-evenly">
                                    <CircularPagination pages={pagination.totalPages}/>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
}

export default Page;