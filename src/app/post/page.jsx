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
// import {router} from "next/client";

const Page = () => {
    const dispatch = useDispatch();
    const {cachePosts, cacheTags} = useSelector((state) => state.cache);
    const searchParams = useSearchParams()
    const router = useRouter();
    const pathname = usePathname()
    const [prefStorage, setPrefStorage] = useState({})
    const [loading, setLoading] = useState(true)
    // const [cachePosts, setCachePosts] = useState([])
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


    useEffect(() => {
        const cacheRaw = sessionStorage.getItem("c");
        const shouldFetch = prefStorage.limit !== undefined && prefStorage.rating !== undefined;

        // if (cacheRaw) {
        //     console.log("masuk cache")
        //     setLoading(true);

            // setTimeout(() => {
                // const cache = verifyToken(cacheRaw);
                //
                // if (cache.currentPage !== p && shouldFetch || s !== cache.search) {
                //     sessionStorage.removeItem("c");
                //     fetchPosts();
                // } else {
                //     setPosts(cache.data);
                //     setRelativeTags(cache.tags);
                //     setPagination(prev => ({ ...prev, totalPages: cache.pages }));
                //     const cacheid = cache.data?.post?.map(post => post.id) || [];
                //     dispatch(setCachePosts(cacheid));
                //     setLoading(false);
                // }
            // }, 300);
        // } else
            if (shouldFetch) {
            fetchPosts();
        }
    }, [s, pagination.currentPage, prefStorage.limit, prefStorage.rating]);



    useEffect(() => {
        if (p) {
            setPagination(prev => ({...prev, currentPage: Number(p)}));
        }
    }, [searchParams]);

    useEffect(() => {
        console.log("Redux State:", cachePosts); // Debugging: Check if state updates
    }, [cachePosts]);



    const setPrefStorageFunc = () => {
        const pref = sessionStorage.getItem("pref");
        if (pref) {
            const data = verifyToken(pref);
            setPrefStorage(data);
            console.log(data, "di post")
            console.log(prefStorage, "store local")
            console.log(prefStorage.limit, "store limit")
        } else {
            const defaultObj = {rating: "safe", limit: 20};
            setPrefStorage(defaultObj);
            const stringPrev = signToken(defaultObj);
            sessionStorage.setItem("pref", stringPrev);
        }
    };



    const fetchPosts = async () => {
        setLoading(true);
        try {
            const { data, tags } = await FetchPosts(s, pagination, prefStorage, pathname);
            setPosts(data);
            setRelativeTags(tags);

            const cacheid = data?.post?.map(post => post.id) || [];
            dispatch(setCachePosts(cacheid));
            // setCacheTags
            const attributes = data['@attributes'];
            let pages
            if (attributes) {
                pages = Math.ceil(Number(attributes.count) / Number(attributes.limit));
                setPagination(prev => ({ ...prev, totalPages: pages }));
            }
            const cache = {data, tags, pages, currentPage: p || pagination.currentPage, search: encodeHtmlEntity(s)};
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
        router.push(`/post/${id}${s ? "?s=" + encodeURIComponent(s): ""}`);
    }


    const renderPosts = () => {

        const data = posts?.post?.map((post, index) => {
            return (
                <div key={index}
                     onClick={() => goToPostDetails(post.id)}
                     className={`md:w-[25vh] md:h-[15vhh] max-sm:w-[28vh]  flex flex-row flex-wrap justify-center items-start rounded-lg hover:opacity-60 `}>
                    <Image
                        src={`${post?.preview_url}`}
                        width={post?.preview_width}
                        height={post?.preview_height}
                        alt="Picture of the author"
                        className="md:max-w-full h-auto max-sm:w-full"
                    />
                </div>)})
        return data

    }

    return (
        <>
            {
                loading ? (
                    <LoadingComp />
                ) : (


                    <div className="w-full h-[100wh]">

                        <div
                            className="md:mt-[5vh] max-sm:gap-4 grid md:gap-y-4 md:ps-[2vh] md:grid-cols-[2fr_3.8fr_3fr] md:grid-rows-[0.1fr_3fr_1fr]">
                            <div className="md:order-1 md:row-start-1 md:col-start-1 md:col-end-4">
                                <SearchBar/>
                            </div>
                            <div className="order-4  md:order-1 md:row-start-2 md:row-end-4 md:col-start-1">
                                <div className="flex flex-row max-md:justify-center flex-wrap gap-2">
                                    {/*from cyan and blue, charact red and red, genre pink and pink*/}
                                    <div className="flex flex-row flex-wrap gap-2 justify-center items-center">

                                        <div
                                            className="bg-green-400 h-[4vh] flex flex-row items-center rounded-lg p-1 text-center text-[10px]  text-green-900">Artist
                                        </div>
                                        <div
                                            className="bg-cyan-400 h-[4vh] flex flex-row items-center rounded-lg p-1 text-center text-[10px]  text-blue-900">Shows/Games
                                        </div>
                                        <div
                                            className="bg-red-400 h-[4vh] flex flex-row items-center rounded-lg p-1 text-center text-[10px]  text-red-900">Characters
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
                                className=" order-3 md:ps-[2vh] md:row-start-2 md:row-end-4 md:col-start-2 md:col-end-5
                         flex flex-wrap items-center justify-center md:justify-start gap-[10px] max-sm:mt-[4vh]

                         ">
                                {renderPosts()}
                            </div>
                            <div
                                className=" order-3 md:col-start-1 md:col-end-4 md:row-start-4 md:row-end-5 max-md:mt-6 md:mb-10">
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