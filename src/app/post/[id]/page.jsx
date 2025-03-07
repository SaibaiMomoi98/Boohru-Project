"use client"
import React, {useEffect} from 'react';
import {useParams, useRouter} from "next/navigation";
import DanbooruUrls from "../../../lib/BaseUrls";
import {verifyToken} from "../../../middleware/hash";
import Image from "next/image";
import Video from 'next-video';
import LoadingComp from "../../../components/LoadingComp";
import {fetchTags} from "../../../Helper/FetchTags";
import RenderTags from "../../../components/RenderTags";
import VideoComp from "../../../components/VideoComp";
import SearchBar from "../../../components/SearchBar";


function Page(props) {
    const router = useRouter();
    const params = useParams()
    const [post, setPost] = React.useState();
    const [arrayId, setArrayId] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [currentTags, setCurrentTags] = React.useState([]);
    const [relativeTags, setRelativeTags] = React.useState([]);

    console.log(params.id)
    const fetchPostWithId = async (id) => {
        setLoading(true);
        try {
            const data = await fetch(`/post.json/${id}`);
            const post = await data.json();
            setPost(post);
            const dataId = localStorage.getItem("c");
            if (dataId) {
                const arrayId = verifyToken(dataId);
                setArrayId(arrayId.id);
            }

            const tags = await fetchTags(post, "", "", params.id);
            console.log(tags);
            setRelativeTags(tags)
        } catch (er) {
            console.log(er)
        } finally {
            setLoading(false);
        }
    }


    const isVideo = post && post[0]?.file_url?.endsWith('.mp4');

    useEffect(() => {
        console.log(arrayId);
        console.log(post)
        console.log()
    }, [arrayId]);

    useEffect(() => {
        fetchPostWithId(params.id);
    }, [params.id]);

    useEffect(() => {
        if (isVideo) {
            fetchVideo()
        }
    }, [post]);

    const currentIndex = arrayId.indexOf(Number(params.id)); // Find the index of the current id


    const handleChangePage = (action) => {
        if (currentIndex === -1) return; // If the current id is not found in the array

        let newIndex = currentIndex;
        if (action === 'next') {
            newIndex = Math.min(currentIndex + 1, arrayId.length - 1); // Move to the next index
        } else if (action === 'previous') {
            newIndex = Math.max(currentIndex - 1, 0); // Move to the previous index
        }

        const newId = arrayId[newIndex]; // Get the new id
        router.push(`/post/${newId}`); // Navigate to the new post
    };

    const directToVideo = (video) => {
        window.location.assign(`${video}`)
    }

    const fetchVideo = async () => {
        try {
            // Use the CORS proxy to fetch the video
            const proxyUrl = 'http://localhost:8080/';
            const videoUrl = post[0]?.file_url; // Get the video URL from the post
            const res = await fetch(`${proxyUrl}${videoUrl}`, {
                method: 'GET',
                headers: {
                    'Origin': window.location.origin, // Set the origin header
                    'X-Requested-With': 'XMLHttpRequest' // This header is also required
                }
            });

            if (!res.ok) {
                throw new Error('Network response was not ok');
            }

            // If you want to create a URL for the video blob
            const videoBlob = await res.blob();
            console.log(res.url);
            const videoObjectUrl = URL.createObjectURL(videoBlob);
            console.log(videoObjectUrl); // You can use this URL to play the video

            // You can also set the video URL in the state if you want to render it
            // setVideoUrl(videoObjectUrl); // Uncomment this if you want to store the video URL in state

        } catch (err) {
            console.log(err);
        }
    };


    return (
        <>
            {loading ? (
                <LoadingComp/>
            ) : (
                <div className="w-full md:h-[100vh] h-auto
                md:gap-y-5
                 grid grid-cols-[0.5fr_1fr_0fr] grid-rows-[0.1fr_0.3fr_1fr_0fr]">
                    {/*search*/}
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
                        <div className={`w-full md:max-w-[50vh]  flex flex-row justify-center items-center`}>

                        {isVideo ? (
                            <Image
                                src={post[0]?.sample_url || post[0]?.preview_url}
                                alt={post[0]?.file_url}
                                priority={true}
                                layout="responsive"
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
                                width={post[0]?.sample_width }
                                height={post[0]?.sample_height}
                                className={`max-h-[85vh] max-md:max-w-[50vh]`}
                            />
                        )}
                        </div>
                    </div>

                    {/*button*/}
                    <div className="
                    order-2 row-start-2 col-start-1 col-end-3
                    md:order-2 md:row-start-2 md:col-start-1 md:col-end-3
                     flex flex-row w-full justify-around items-center">
                        <button onClick={() => handleChangePage('previous')} disabled={currentIndex <= 0}
                                hidden={currentIndex === 0}>
                            Previous
                        </button>
                        <button onClick={() => handleChangePage('next')} disabled={currentIndex >= arrayId.length - 1}
                                hidden={currentIndex + 1 === arrayId.length}>
                            Next
                        </button>
                    </div>
                </div>
            )}
        </>
    );

}

export default Page;