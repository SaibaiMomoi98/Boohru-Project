"use client"
import React, {cache, useEffect} from 'react';
import {useParams, useRouter, useSearchParams} from "next/navigation";
import DanbooruUrls from "../../../lib/BaseUrls";
import {signToken, verifyToken} from "../../../middleware/hash";
import Image from "next/image";
import Video from 'next-video';
import LoadingComp from "../../../components/LoadingComp";
import {fetchTags} from "../../../Helper/FetchTags";
import RenderTags from "../../../components/RenderTags";
import VideoComp from "../../../components/VideoComp";
import SearchBar from "../../../components/SearchBar";
import {FetchPosts} from "../../../Helper/FetchPost";
import {isNumber} from "node:util";
import {useDispatch, useSelector} from "react-redux";
import {setCachePost, setCachePosts} from "../../../lib/cacheSlice/cacheSlice";
import {setPrefStorage} from "../../../lib/prefStorage/PrefStorage";
import {encodeHtmlEntity} from "../../../Helper/encodeDecodeHtmlTags";


function Page(props) {
    const dispatch = useDispatch();
    const router = useRouter();
    const {prefStorage} = useSelector((state) => state.pref);
    const params = useParams()
    const [post, setPost] = React.useState();
    const [arrayId, setArrayId] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [currentTags, setCurrentTags] = React.useState([]);
    const [relativeTags, setRelativeTags] = React.useState([]);
    const [relativePost, setRelativePost] = React.useState([]);
    const [relativeData, setRelativeData] = React.useState({
        currentPage:0,
        search: "",
    });
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [lastId, setLastId] = React.useState(null);
    const [nextId, setNextId] = React.useState(null);
    const [hideButton, setHideButton] = React.useState({
        next: false,
        prev: false,
    });
    const {cachePosts, cachePost} = useSelector((state) => state.cache);
    const searchParams = useSearchParams()
    const s = searchParams.get("s")

    const fetchPostWithId = async (id) => {
        setLoading(true);
        try {
            const data = await fetch(`/post.json/${id}`);
            const post = await data.json();
            setPost(post);



            const tags = await fetchTags(post, "", "", params.id);
            // console.log(tags);
            setRelativeTags(tags)
            if (tags, tags.creator.length > 0 || tags.character.length > 0) {
                // console.log(tags.creator[0].name);
                const pref = sessionStorage.getItem("pref");
                // const prefStorage = verifyToken(pref);
                dispatch(setPrefStorage(pref));
                const creatorTag = tags.creator.length > 0 ? tags.creator[0].name : null;
                const characterTag = tags.character.length > 0 ? tags.character[0].name : null;


                const tagToUse = creatorTag || characterTag;
                console.log(prefStorage, 'prefstorage di fetchpostid')
                if (tagToUse) {
                    const {data} = await FetchPosts(tagToUse, {currentPage: 0}, {
                        limit: 5,
                        rating: prefStorage.rating
                    }, "");
                    const attributes = data['@attributes'];
                    if (attributes) {
                        const pages = Math.ceil(Number(attributes.count) / Number(attributes.limit));
                        const randomPages = Math.floor(Math.random() * pages)
                        const {data} = await FetchPosts(tagToUse, {currentPage: randomPages}, {
                            limit: 5,
                            rating: prefStorage.rating
                        }, "");
                        setRelativePost(data);
                        setRelativeData((prev) => ({...prev, search: tagToUse, currentPage: randomPages}));
                    }
                } else {
                    console.log("No valid tags found for fetching related posts.");
                }

            }
        } catch (er) {
            console.log(er)
        } finally {
            setLoading(false);
        }
    }


    const FetchFromIndex = async () => {
        try {
            console.log(currentIndex, "index sekarang");
            console.log(currentIndex === 0, "mau ngefetch sebelum");
            console.log(cachePost.search || relativeTags?.creator[0]?.name || relativeTags?.character[0]?.name, Number(cachePost.currentPage) - 1, prefStorage, "")
            console.log(cachePost)

            const searchKey = cachePost.search || relativeTags?.creator[0]?.name || relativeTags?.character[0]?.name;
            const currentPage = cachePost.currentPage;
            const ratingKey = prefStorage.rating;

            const existingCache = sessionStorage.getItem("c");
            let cache = existingCache ? verifyToken(existingCache) : {};

            // Check if the cache for the current rating and search term exists
            if (!cache[ratingKey]) {
                cache[ratingKey] = {};
            }

            if (!cache[ratingKey][searchKey]) {
                cache[ratingKey][searchKey] = {
                    pages: 0,
                    cache: [],
                };
            }
            console.log(cache, "dari fetchIndex")

            const currentCache = cache[ratingKey][searchKey];
            const cachePageKeys = currentCache.cache.map((entry) => Object.keys(entry)[0]);
            // console.log(cachePageKeys.includes(), "current page cache");

            // dispatch(setCachePosts({}));

            const currentPageToFetch = currentCache.currentPage || relativeData.currentPage;

            const isPageCached = (pageToCheck) => {
                return cachePageKeys.includes(pageToCheck.toString())
            }

            if (currentIndex === 0) { //prevPost
                // s, pagination, prefStorage, pathname
                if (currentPageToFetch === 0) {
                    setHideButton((prev) => ({...prev, prev: true}))
                    return none;
                } else {
                    let previousPage = Number(currentPageToFetch) - 1
                    const {data, tags} = await FetchPosts(
                        cachePost.search || relativeTags?.creator[0]?.name || relativeTags?.character[0]?.name, {currentPage: previousPage}, prefStorage, true)
                    // console.log(data)
                    // dispatch(setCachePosts(data));
                    // const signToken()

                    const checkPage = isPageCached(previousPage);
                    if (!checkPage) {
                        currentCache.cache.push({
                            [previousPage]: {data, tags},
                        })

                        console.log(cache, "cache data with previous page")
                        const stringNextCache = signToken(cache)
                        sessionStorage.setItem("c", stringNextCache)

                    }


                    const prevId = data.post.map((el, i) => el.id)
                    const lastFetchedId = prevId[prevId.length - 1];


                    console.log(prevId, lastFetchedId, "prev")

                    if (lastFetchedId) {
                        setLastId(lastFetchedId);
                    }


                }
            } else if (currentIndex === arrayId.length - 1) { //next post
                if (arrayId.length < prefStorage.limit) {
                    setHideButton((prev) => ({...prev, next: true}))
                    return none;
                }
                
                let nextPage = Number(currentPageToFetch) + 1;
                const {data, tags} = await FetchPosts(cachePost.search || relativeTags?.creator[0]?.name || relativeTags?.character[0]?.name, {currentPage: nextPage}, prefStorage, true);
                const checkCachePage = isPageCached(nextPage)

                if (!checkCachePage) {
                    currentCache.cache.push({
                        [nextPage]: {data, tags},
                    })

                    // console.log(currentCache, "cache updated")
                    const stringNextCache = signToken(cache)
                    sessionStorage.setItem("c", stringNextCache)
                }
                // console.log(checkCachePage, "check next page cached")
                const nextId = data.post.map((el, i) => el.id)
                if (nextId){
                const nextFetchedId = nextId[0];
                console.log(data, nextId, nextFetchedId, "masuk next page")
                setNextId(nextFetchedId);
                }
            }
        } catch (error) {
            console.log(error)
        }
    }


    const isVideo = post && post[0]?.file_url?.endsWith('.mp4');

    // useEffect(() => {
    //     console.log(cachePost, "cache ini ")
    //
    // }, [cachePost]);


    useEffect(() => {

        const cacheRaw = sessionStorage.getItem("c");
        const cacheIdRaw = sessionStorage.getItem("ci");


        if (cacheRaw && cacheIdRaw) {
            const cache = verifyToken(cacheRaw);
            const cacheId = verifyToken(cacheIdRaw);

            console.log(cache, "cache");
            console.log(cacheId, "cacheId");

            const ratingKey = prefStorage.rating; // e.g., "safe" or "nsfw"
            const searchKey = cacheId.search; // e.g., "character1" or "creator1"

            // Check if the cache for the current rating and search term exists
            if (cache[ratingKey] && cache[ratingKey][searchKey]) {
                const searchCacheData = cache[ratingKey][searchKey];


                const currentPagePost = searchCacheData.cache.find((el) => Number(Object.keys(el)) === Number(cacheId.currentPage));
                console.log(cacheId.currentPage, "current Page")
                console.log(searchCacheData, "currentPage");
                
                console.log(searchCacheData.cache.find((el) => Number(Object.keys(el)) === Number(cacheId.currentPage)), "currentPagePost");
                
                if (currentPagePost) {
                    const {data} = currentPagePost[cacheId.currentPage];
                    const arrayId = data.post.map((el) => el.id);

                    // Find the index of the current post in the arrayId
                    console.log(arrayId, "arrayId");
                    const currentIndexCache = arrayId.indexOf(Number(params.id));
                    if (currentIndexCache === -1) {
                        console.log("masuk dulu")
                    }
                    console.log(currentIndexCache, "currentIndexCache");
                    // if (currentIndexCache !== -1) {
                        setArrayId(arrayId);
                        setCurrentIndex(currentIndexCache); 
                        dispatch(setCachePost(cacheId))
                        dispatch(setCachePosts(arrayId));

                        console.log("Post data loaded from cache");
                    // }
                }
            }
        } else {
            setHideButton((prev) => ({...prev , next: true, prev: true}));
        }
        if (prefStorage.rating) {
            fetchPostWithId(params.id);
        }

    }, [params.id, prefStorage.rating]);


    useEffect(() => {
        const prefRaw = sessionStorage.getItem("pref");
        if (prefRaw) {
            dispatch(setPrefStorage(prefRaw));
        }

    }, [])

    console.log(cachePosts, "cache post");
    console.log(cachePost, "cache post search");



    // useEffect(() => {
    //     console.log('Pref Storage:', prefStorage);
    //     console.log('Cache Posts:', cachePosts);
    // }, [prefStorage, cachePosts]);

    useEffect(() => {
        if (Object.keys(relativeTags).length > 0) {
            if (relativeTags?.creator?.[0]?.name || relativeTags?.character?.[0]?.name) {
                FetchFromIndex();
            }
        }
    }, [relativeTags]);

    const handleChangePage = (action) => {
        if (isNumber(action)) {
            if (relativeData){
                console.log(relativeData, "relativeData");
                const signTokenCi = signToken(relativeData);
                sessionStorage.setItem("ci", signTokenCi);
            }
            router.push(`/post/${action}`);
            return;
        }

        if (currentIndex === -1) return;

        let newIndex = currentIndex;
        let newId = arrayId[currentIndex];

        if (action === "next") {
            if (currentIndex === arrayId.length - 1) {
                if (nextId) {
                    console.log(nextId, "nextId")
                    const cacheId = sessionStorage.getItem("ci");
                    const cacheIdObj = verifyToken(cacheId);
                    console.log(cacheIdObj, "cache id brr");
                    const cache = {search: cacheIdObj.search, currentPage: Number(cachePost.currentPage) + 1};
                    console.log(cache, "cache next");
                    const string = signToken(cache);
                    sessionStorage.setItem("ci", string);
                    router.push(`/post/${nextId}${s ? "?s=" + encodeURIComponent(s) : ""}`);
                    return;
                }
            } else {
                newIndex = Math.min(currentIndex + 1, arrayId.length - 1);
                newId = arrayId[newIndex];
            }
        } else if (action === "previous") {
            if (currentIndex === 0) {
                if (lastId) {
                    const cacheId = sessionStorage.getItem("ci");
                    const cacheIdObj = verifyToken(cacheId);
                    console.log(cacheIdObj, "cache id brr");
                    console.log(cachePost, "cache id post");
                    const cache = {
                        search: cacheId.search,
                        currentPage: cacheIdObj.currentPage <= 1 ? 1 : Number(cachePost.currentPage) - 1
                    };
                    console.log(cache, "cache again");
                    const string = signToken(cache);
                    sessionStorage.setItem("ci", string);
                    router.push(`/post/${lastId}${s ? "?s=" + encodeURIComponent(s) : ""}`);
                    return;
                } else {
                    console.log("No previous posts available.");
                    return;
                }
            } else {
                newIndex = Math.max(currentIndex - 1, 0);
                newId = arrayId[newIndex];
            }
        }

        router.push(`/post/${newId}${s ? "?s=" + encodeURIComponent(s) : ""}`);
    };

    const directToVideo = (video) => {
        window.location.assign(`${video}`)
    }

    // const fetchVideo = async () => {
    //     try {
    //         // Use the CORS proxy to fetch the video
    //         const proxyUrl = 'http://localhost:8080/';
    //         const videoUrl = post[0]?.file_url; // Get the video URL from the post
    //         const res = await fetch(`${proxyUrl}${videoUrl}`, {
    //             method: 'GET',
    //             headers: {
    //                 'Origin': window.location.origin, // Set the origin header
    //                 'X-Requested-With': 'XMLHttpRequest' // This header is also required
    //             }
    //         });
    //
    //         if (!res.ok) {
    //             throw new Error('Network response was not ok');
    //         }
    //
    //
    //         const videoBlob = await res.blob();
    //         // console.log(res.url);
    //         const videoObjectUrl = URL.createObjectURL(videoBlob);
    //         // console.log(videoObjectUrl); // You can use this URL to play the video
    //
    //     } catch (err) {
    //         console.log(err);
    //     }
    // };


    return (
        <>
            {loading ? (
                <LoadingComp/>
            ) : (
                <div className="w-full md:h-auto h-auto
                md:gap-y-5
                 grid grid-cols-[0.5fr_1fr_0fr] grid-rows-[0.1fr_0.3fr_1fr_0fr_0fr]">
                    {/*search*/}
                    {isVideo ? (
                        <div>Currently for video format doesn't support</div>
                    ) : (
                        <div></div>
                    )}
                    <div className="order-1 col-start-1 col-end-3 row-start-1">
                        <SearchBar/>
                    </div>
                    {/*tags*/}
                    <div className="
                    md:ps-10
                    max-sm:pt-[4vh]
                    order-3 md:order-2
                    md:row-start-2 md:col-start-1 md:col-end-1 md:row-start-3
                    order-3 row-start-4 col-start-1 col-end-3
                    ">
                        <div className="flex flex-row max-md:justify-center flex-wrap gap-2">
                            <RenderTags relativeTags={relativeTags}/>
                        </div>
                    </div>
                    {/*post*/}
                    <div className="
                    row-start-3 col-start-1 col-end-3
                    order-2 md:row-start-3 md:row-end-3 md:col-start-2 md:col-end-3
                    flex flex-row justify-center items-center
                    md:ps-10

                     ">
                        <div className={`w-full md:max-w-[80vh]  flex flex-row justify-center items-start`}>

                            {isVideo ? (
                                <Image
                                    src={post[0]?.sample_url || post[0]?.preview_url}
                                    alt={post[0]?.file_url}
                                    priority={true}
                                    layout="responsive"
                                    className={`max-h-[100%] max-md:max-w-[90%]`}
                                    width={post[0]?.preview_width * 6}
                                    height={post[0]?.preview_height * 6}
                                    onClick={() => window.open(post[0]?.file_url, "_blank")}
                                />
                            ) : (
                                <Image
                                    src={post[0]?.sample_url || post[0]?.file_url}
                                    alt={post[0]?.file_url}
                                    priority={true}
                                    layout="responsive"
                                    width={post[0]?.sample_width * 2}
                                    height={post[0]?.sample_height * 2}
                                    className={`max-h-[100%] max-w-[80%]`}
                                />
                            )}
                        </div>
                    </div>

                    {/*button*/}
                    <div className="
                    order-2 row-start-2 col-start-1 col-end-3
                    md:order-2 md:row-start-2 md:col-start-1 md:col-end-3
                     flex flex-row w-full justify-around items-center">
                        <button onClick={() => handleChangePage('previous')}
                                disabled={hideButton.prev}
                                hidden={hideButton.prev}
                        >
                            Previous
                        </button>
                        <button onClick={() => handleChangePage('next')}
                                disabled={hideButton.next}
                                hidden={hideButton.next}
                        >
                            Next
                        </button>
                    </div>

                    {/*relative post*/}
                    <div className=' h-[30vh]
                        md:order-3 md:row-start-4 md:row-end-5 md:col-start-1 md:col-end-3
                        h-auto max-w-full
                        row-start-5 col-start-1 col-end-3 order-4
                        '>
                        <h1>Related To {relativeTags?.creator[0]?.name || relativeTags?.character[0]?.name}</h1>
                        <div className="
                        flex flex-row flex-wrap gap-2 justify-center items-center

                        ">

                            {relativePost?.post?.map((item, index) => (
                                <div key={index}
                                     className="max-h-[40vh] overflow-hidden  md:w-[25vh] w-[13vh] hover:opacity-40 hover:cursor-pointer"
                                     onClick={() => handleChangePage(item.id)}>
                                    <Image
                                        src={`${item?.preview_url}`}
                                        width={item?.preview_width}
                                        height={item?.preview_height}
                                        alt="Picture of the author"
                                        layout="responsive"
                                        className={`max-h-[100vh] w-auto rounded-lg`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );

}

export default Page;