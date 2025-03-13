"use client"
import React, {useEffect} from 'react';
import {useParams, useRouter} from "next/navigation";
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
import {setCachePosts} from "../../../lib/cacheSlice/cacheSlice";
import {setPrefStorage} from "../../../lib/prefStorage/PrefStorage";

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
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [lastId, setLastId] = React.useState(null);
    const [nextId, setNextId] = React.useState(null);
    const cachePost = useSelector((state) => state.cache.cachePosts);


    const fetchPostWithId = async (id) => {
        setLoading(true);
        try {
            const data = await fetch(`/post.json/${id}`);
            const post = await data.json();
            setPost(post);


            console.log(cachePost);

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
            // dispatch(setCachePosts({}));

            if (currentIndex === 0) {
                // s, pagination, prefStorage, pathname
                if (cachePost.currentPage === 0) {
                    return none;
                } else {
                    const {data,tags} = await FetchPosts(
                        cachePost.search || relativeTags?.creator[0]?.name || relativeTags?.character[0]?.name, { currentPage: Number(cachePost.currentPage) - 1}, prefStorage, true)
                    // console.log(data)
                    // dispatch(setCachePosts(data));
                    // const signToken()
                    const cachePrev = {data}
                    const prevId = data.post.map((el, i) => el.id)
                    const lastFetchedId = prevId[prevId.length - 1];

                    if (lastFetchedId) {
                        setLastId(lastFetchedId);
                        // const prefStrings = signToken(data)
                        // sessionStorage.setItem("pref", prefStrings);
                    }

                }
            } else if (currentIndex === arrayId.length) {

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
        if (prefStorage.rating) {
            fetchPostWithId(params.id);
        }

        const cacheRaw = sessionStorage.getItem("c");
        if (cacheRaw) {
            const cache = verifyToken(cacheRaw);
            const ratingKey = prefStorage.rating; // e.g., "safe" or "nsfw"

            // If there's no searchKey, use relativeTags.character or relativeTags.creator to find a matching cache
            let searchKey = encodeHtmlEntity(s); // Encode the search term
            if (!searchKey && relativeTags.character.length > 0) {
                // Find a matching cache key based on relativeTags.character
                const characterTags = relativeTags.character.map((tag) => tag.name);
                searchKey = Object.keys(cache[ratingKey] || {}).find((key) =>
                    characterTags.includes(key)
                );
            }

            if (!searchKey && relativeTags.creator.length > 0) {
                // Find a matching cache key based on relativeTags.creator
                const creatorTags = relativeTags.creator.map((tag) => tag.name);
                searchKey = Object.keys(cache[ratingKey] || {}).find((key) =>
                    creatorTags.includes(key)
                );
            }

            const searchCacheData = cache[ratingKey]?.[searchKey]; // Get cache for the current rating and search term

            if (searchCacheData) {
                const arrayId = searchCacheData.cache.flatMap((entry) => {
                    const pageKey = Object.keys(entry)[0]; // Get the page key (e.g., "1", "2")
                    return entry[pageKey].data.post.map((post) => post.id); // Extract post IDs
                });

                const currentIndex = arrayId.indexOf(Number(params.id));
                setArrayId(arrayId);
                setCurrentIndex(currentIndex);
                dispatch(setCachePosts(searchCacheData)); // Update Redux cache
            } else {
                console.log("No cache found for the current search term or tags.");
            }
        } else {
            console.log("No cache found in sessionStorage.");
            router.push("/"); // Redirect if no cache is found
        }
    }, [params.id, prefStorage.rating,relativeTags.character, relativeTags.creator]);


    useEffect(() => {
        const prefRaw = sessionStorage.getItem("pref");
        if (prefRaw) {
            dispatch(setPrefStorage(prefRaw));
        }

    }, [])

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
            router.push(`/post/${action}`);
            return;
        }

        if (currentIndex === -1) return;

        let newIndex = currentIndex;
        let newId = arrayId[currentIndex];

        if (action === "next") {
            newIndex = Math.min(currentIndex + 1, arrayId.length - 1);
            newId = arrayId[newIndex];
        } else if (action === "previous") {
            if (currentIndex === 0) {
                if (lastId) {
                    router.push(`/post/${lastId}`);
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
                    {/*post*/}
                    <div className="
                    row-start-3 col-start-1 col-end-3
                    order-2 md:row-start-3 md:row-end-3 md:col-start-2 md:col-end-3
                    flex flex-row justify-center items-center
                    md:ps-10

                     ">
                        <div className={`w-full md:max-w-[80vh]  flex flex-row justify-center items-center`}>

                            {isVideo ? (
                                <Image
                                    src={post[0]?.sample_url || post[0]?.preview_url}
                                    alt={post[0]?.file_url}
                                    priority={true}
                                    layout="responsive"
                                    className={`max-h-[85vh] max-md:max-w-[50vh]`}
                                    width={post[0]?.preview_width * 6}
                                    height={post[0]?.preview_height * 6}
                                    onClick={() => directToVideo(post[0]?.file_url)}
                                />
                            ) : (
                                <Image
                                    src={post[0]?.sample_url || post[0]?.file_url}
                                    alt={post[0]?.file_url}
                                    priority={true}
                                    layout="responsive"
                                    width={post[0]?.sample_width * 2}
                                    height={post[0]?.sample_height * 2}
                                    className={`max-h-[100vh] max-w-[60vh]`}
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
                            // disabled={currentIndex <= 0}
                            // hidden={currentIndex === 0}
                        >
                            Previous
                        </button>
                        <button onClick={() => handleChangePage('next')} disabled={currentIndex >= arrayId.length - 1}
                                hidden={currentIndex + 1 === arrayId.length}>
                            Next
                        </button>
                    </div>

                    {/*relative post*/}
                    <div className=' w-[50vh] h-[30vh]
                        md:order-3 md:row-start-4 md:row-end-5 md:col-start-1 md:col-end-3
                        h-auto w-full
                        row-start-5 col-start-1 col-end-3 order-4
                        '>
                        <h1>Related To {relativeTags?.creator[0]?.name || relativeTags?.character[0]?.name}</h1>
                        <div className="
                        flex flex-row flex-wrap gap-2 justify-center items-center

                        ">

                            {relativePost?.post?.map((item, index) => (
                                <div key={index}
                                     className="max-h-[40vh]  md:w-[25vh] w-[13vh] hover:opacity-40 hover:cursor-pointer"
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