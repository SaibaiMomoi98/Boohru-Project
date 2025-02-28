"use client"
import React, {useEffect, useState} from 'react';
import SearchBar from "../../components/SearchBar";
import {usePathname} from "next/navigation";
import {verifyToken} from "../../middleware/hash";
import Image from 'next/image'


const Page = () => {
    const pathname = usePathname()
    const [prefStorage, setPrefStorage] = useState({})
    const [loading, setLoading] = useState(false)
    const [refresh, setRefresh] = useState(false)
    const [currentPage, setCurrentPage] = useState(0)
    const [posts, setPosts] = useState({})
    const [relativeTags, setRelativeTags] = useState({
        creator: [],
        character: [],
        from: [],
        genre: []
    })


    useEffect(() => {
        setPrefStorageFunc()
    }, []);

    useEffect(() => {
        console.log(loading)
    }, [loading]);

    useEffect(() => {
        if (Object.keys(prefStorage).length > 0) {
            fetchPosts();

        }
    }, [currentPage, prefStorage]);


    const setPrefStorageFunc = () => {
        const pref = sessionStorage.getItem("pref");
        if (pref) {
            const data = verifyToken(pref);
            setPrefStorage(data);
        }

        const page = sessionStorage.getItem("p");
        if (page && !refresh) {
            setRefresh(true);
            setCurrentPage(page);
        }
    }

    const currentPageFunc = (e) => {
        const value = e.target.value;
        setCurrentPage(value);
        sessionStorage.setItem("p", value)
    }


    // const fetchTags = async (data) => {
    //     try {
    //         let rawTagsSet = [];
    //         if (data.post && data.post.length > 0) {
    //             data.post.forEach((el) => {
    //                 if (el.tags) {
    //                     rawTagsSet.push(el.tags);
    //                 }
    //             });
    //         }
    //
    //         rawTagsSet = rawTagsSet.join(" ").split(" ")
    //         const tagsSet = new Set(rawTagsSet);
    //         const tagsDuplicateFilter = [...tagsSet];
    //         const arrayEncoded = tagsDuplicateFilter.map(item => encodeURIComponent(item));
    //         const arraySearch = prefStorage.tags ? prefStorage.tags.split("+") : [];
    //         let resR = await fetch(`/tags.json/?names=${arrayEncoded.join("+")}&limit=100&orderBy=count&order=desc&includeOffset=true`);
    //         let jsonR = await resR.json();
    //         let arrFullTags = []
    //         const attributesArr = jsonR['@attributes'];
    //         if (jsonR?.tag?.length === 100) {
    //             const pageCountTags = Math.floor(Number(attributesArr.count) / Number(attributesArr.limit));
    //             for (let i = 1; i <= pageCountTags; i++) {
    //                 const resT = await fetch(`/tags.json/?names=${arrayEncoded.join("+")}&limit=100&orderBy=count&order=desc&includeOffset=true&page=${i}`);
    //                 const pageData = await resT.json();
    //                 arrFullTags.push(...jsonR.tag, ...pageData?.tag);
    //             }
    //         } else {
    //             console.log(jsonR);
    //             arrFullTags.push(...jsonR.tag);
    //         }
    //         const filterCreator = arrFullTags.filter(tag => tag.type === 1);
    //         const filterCharacter = arrFullTags.filter(tag => tag.type === 4);
    //         const filterNameShow = arrFullTags.filter(tag => tag.type === 3);
    //         const filterDescriptionGenre = arrFullTags.filter(tag => tag.type === 0);
    //
    //         // setRelativeTags(arrTags)
    //         setRelativeTags({
    //             creator: filterCreator,
    //             character: filterCharacter,
    //             from: filterNameShow,
    //             genre: filterDescriptionGenre
    //         });
    //     } catch (e) {
    //         console.log(e);
    //     }
    // };


    const fetchTags = async (data) => {
        try {
            // Collect raw tags from posts
            const rawTagsSet = data.post?.flatMap(el => el.tags ? el.tags.split(" ") : []) || [];
            const tagsSet = new Set(rawTagsSet);
            const arrayEncoded = [...tagsSet].map(item => encodeURIComponent(item));

            // Fetch tags from the API
            const fetchTagsFromApi = async (page = 1) => {
                const response = await fetch(`/tags.json/?names=${arrayEncoded.join("+")}&limit=100&orderBy=count&order=desc&includeOffset=true&page=${page}`);
                return response.json();
            };

            const initialData = await fetchTagsFromApi();
            let arrFullTags = initialData.tag || [];
            const attributesArr = initialData['@attributes'];

            // Fetch additional pages if necessary
            if (initialData.tag?.length === 100) {
                const pageCountTags = Math.floor(Number(attributesArr.count) / Number(attributesArr.limit));
                const additionalPages = await Promise.all(
                    Array.from({ length: pageCountTags }, (_, i) => fetchTagsFromApi(i + 2))
                );
                additionalPages.forEach(pageData => {
                    arrFullTags.push(...(pageData.tag || []));
                });
            }

            // Filter tags by type
            const filterTagsByType = (type) => arrFullTags.filter(tag => tag.type === type);
            setRelativeTags({
                creator: filterTagsByType(1),
                character: filterTagsByType(4),
                from: filterTagsByType(3),
                genre: filterTagsByType(0)
            });
        } catch (e) {
            console.error(e);
        }
    };


    const fetchPosts = async () => {
        let urlPost = '/post.json?includeOffset=true';
        setLoading(true)
        try {
            if (prefStorage.tags || prefStorage.rating === "safe") {
                urlPost += `&tags=${prefStorage.tags}+rating:${prefStorage.rating}`;
            }
            if (prefStorage.limit) {
                urlPost += `&limit=${prefStorage.limit}`;
            }
            const response = await fetch(`${urlPost}&page=${currentPage}`);
            const data = await response.json();
            console.log(`${urlPost}&page=${currentPage}`, prefStorage, data); // Log the response data
            setPosts(data);
            fetchTags(data);
        } catch (er) {
            console.log(er);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-auto">
            {loading ? (
                <div className="flex flex-row justify-center items-center h-[100vh]">Loading...</div>
            ) : (
                <div
                    className="md:mt-[5vh] max-sm:gap-4 grid md:gap-y-4 md:ps-[2vh] md:grid-cols-[2fr_3.8fr_3fr] md:grid-rows-[0.4fr_3fr_1fr]">
                    <div className="md:order-1 md:row-start-1 md:col-start-1">
                        <SearchBar/>
                    </div>
                    <div className="order-4 md:order-1 md:row-start-2 md:row-end-4 md:col-start-1">
                        <div className="flex flex-row flex-wrap gap-2">
                            {/*from cyan and blue, charact red and red, genre pink and pink*/}
                            <div className="flex flex-row flex-wrap gap-2 justify-center items-center">

                                <div
                                    className="bg-green-400 h-[4vh] flex flex-row items-center rounded-lg p-1 text-center text-[10px]  text-green-900">Artist
                                </div>
                                <div
                                    className="bg-cyan-400 h-[4vh] flex flex-row items-center rounded-lg p-1 text-center text-[10px]  text-blue-900">Shows/Games
                                </div>
                                <div
                                    className="bg-red-400 h-[4vh] flex flex-row items-center rounded-lg p-1 text-center text-[10px]  text-red-900">Character
                                </div>
                                <div
                                    className="bg-pink-400 h-[4vh] flex flex-row items-center rounded-lg p-1 text-center text-[10px] text-pink-900">Genre
                                    & Other
                                </div>
                            </div>
                            <div className="h-[2px] bg-pink-400 w-full my-4"></div>
                            {relativeTags.creator?.map((item, index) => (
                                <div key={index}
                                     className=" bg-green-400 h-[4vh] flex flex-row items-center rounded-lg p-1 text-center hover:bg-pink-600 hover:cursor-pointer">
                                    <a className="text-[10px]  text-green-900">{item?.name.split("_").join(" ")}</a>
                                    {/*<p>{item?.count}</p>*/}
                                </div>
                            ))}{relativeTags.from?.map((item, index) => (
                            <div key={index}
                                 className=" bg-cyan-400 h-[4vh] flex flex-row items-center rounded-lg p-1 text-center hover:bg-pink-600 hover:cursor-pointer">
                                <a className="text-[10px]  text-blue-900">{item?.name.split("_").join(" ")}</a>
                                {/*<p>{item?.count}</p>*/}
                            </div>
                        ))}

                            {relativeTags.character?.map((item, index) => (
                                <div key={index}
                                     className=" bg-red-400 h-[4vh] flex flex-row items-center rounded-lg p-1 text-center hover:bg-pink-600 hover:cursor-pointer">
                                    <a className="text-[10px]  text-red-900">{item?.name.split("_").join(" ")}</a>
                                    {/*<p>{item?.count}</p>*/}
                                </div>
                            ))}

                            {relativeTags.genre?.slice(0, 35).map((item, index) => (
                                <div key={index}
                                     className="bg-pink-400 h-[4vh] flex flex-row items-center rounded-lg p-1 text-center hover:bg-pink-600 hover:cursor-pointer">
                                    <a className="text-[10px] text-pink-900">{item?.name.split("_").join(" ")}</a>
                                    {/*<p>{item?.count}</p>*/}
                                </div>
                            ))}

                        </div>
                    </div>
                    <div
                        className=" order-3 md:ps-[2vh] md:row-start-1 md:row-end-4 md:col-start-2 md:col-end-5
                         flex flex-wrap items-center justify-center md:justify-start gap-[10px]">
                        {posts?.post?.map((post, index) => (
                            <div key={index}
                                 className={`md:w-[${post?.preview_width}] md:h-[${post?.preview_height}] flex flex-row flex-wrap justify-center items-start rounded-lg`}>
                                <Image
                                    src={`${post?.preview_url}`}
                                    width={post?.preview_width}
                                    height={post?.preview_height}
                                    alt="Picture of the author"
                                    className="max-w-full h-auto"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="order-3 md:col-start-2 md:row-start-4 md:row-end-5 bg-yellow-200">
                        <h1>1 2 3 4 5 6</h1>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Page;