import { fetchTags } from "@/Helper/FetchTags";
import {signToken} from "@/middleware/hash"; // Adjust the import path as necessary

export const FetchPosts = async (s, pagination, prefStorage, pathname) => {
    let urlPost = '/post.json?includeOffset=true';
    const decodedSearch = decodeURIComponent(s);
    const search = decodedSearch.split(" ").map((item) => {
        return encodeURIComponent(item);
    }).join("+");

    if (s || s === "" || !s) {
        urlPost += `&tags=${!s ? "" : search}${prefStorage.rating === "safe" ? "+rating:safe" : ""}`;
    }
    if (prefStorage.limit) {
        urlPost += `&limit=${prefStorage.limit}`;
    }

    try {
        // console.log(`${urlPost}&page=${pagination.currentPage}`)
        const response = await fetch(`${urlPost}&page=${pagination.currentPage}`);
        const data = await response.json();
        if (pathname === "/post") {
        const tags = await fetchTags(data, s, prefStorage);
        return { data, tags };
        } else{
            return {data}
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};
