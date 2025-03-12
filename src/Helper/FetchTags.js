import {decodeHtmlEntity, encodeHtmlEntity} from "@/Helper/encodeDecodeHtmlTags";
import tag from "jsonwebtoken/lib/NotBeforeError";

export const fetchTags = async (data, s, prefStorage, idParams) => {
        let inFetchTagsContinue = false;
    try {
        // Collect raw tags from posts
        const rawTagsSet = data.post?.flatMap(el => el.tags ? el.tags.split(" ") : []) || [];
        const tagsSet = new Set(rawTagsSet);
        const arrayEncoded = [...tagsSet].map(item => decodeHtmlEntity(item));

        // console.log(arrayEncoded.join("+"));
        const MAX_TAGS = 900; // Set a limit for the number of tags
        const limitedTags = arrayEncoded.slice(0, MAX_TAGS); // Take only the first MAX_TAGS


        // Fetch tags from the API
        const fetchTagsFromApi = async (page = 0) => {
            if (s) {
                // console.log(`/tags.json/?names=${limitedTags.join("+")}&limit=100&orderBy=count&order=desc&includeOffset=true&page=${page}`)
                const response = await fetch(`/tags.json/?names=${limitedTags.join("+")}&limit=100&orderBy=count&order=desc&includeOffset=true&page=${page}`);
                inFetchTagsContinue = true
                return response.json();
            } else if (data[0]?.id === Number(idParams) && data?.length === 1) {
                const datalength = data[0]?.tags?.split(" ").length
                if (datalength >= 100) {
                    inFetchTagsContinue = true;
                }

                const arrayEncodedFromTags = data[0]?.tags?.split(" ").map((item) => {

                    const hasPlus = item.includes('+');

                    const hasHtmlEntities = /&[a-zA-Z0-9#]+;/.test(item); // Regex to check for HTML entities

                    if (hasPlus && hasHtmlEntities) {
                        return encodeURIComponent (item);
                    } else if (hasPlus) {
                        return encodeURIComponent(item);
                    } else if (hasHtmlEntities) {
                        return decodeHtmlEntity(item);
                    } else {
                        return item;
                    }
                }).join("+");



                const response = await fetch(`/tags.json/?names=${arrayEncodedFromTags}&limit=${inFetchTagsContinue ? 100 : datalength}&orderBy=count&order=desc&includeOffset=true&page=${page}`);
                // console.log(`/tags.json/?names=${arrayEncodedFromTags}&limit=${inFetchTagsContinue ? 100 : datalength}&orderBy=count&order=desc&includeOffset=true&page=${page}`)
                return response.json();
            } else if (!s) {
                const response = await fetch(`/tags.json/?limit=100&orderBy=count&order=desc&includeOffset=true&page=${page}`);
                return response.json();
            }
        };

        const initialData = await fetchTagsFromApi();
        // console.log(initialData);
        let arrFullTags = initialData.tag || [];
        const attributesArr = initialData['@attributes'];

        // Fetch additional pages if necessary
        if (s || inFetchTagsContinue) {
            if (initialData.tag?.length === 100) {
                const pageCountTags = Math.floor(Number(attributesArr.count) / Number(attributesArr.limit));
                const additionalPages = await Promise.all(
                    Array.from({length: pageCountTags}, (_, i) => fetchTagsFromApi(i + 1))
                );
                additionalPages.forEach(pageData => {
                    arrFullTags.push(...(pageData.tag || []));
                });
            }
        }

        const filterTagsByType = (type) => arrFullTags.filter(tag => tag.type === type).map((tag) => {
            return {
                ...tag,
                name: decodeHtmlEntity(tag.name),
            }
        })
        // console.log(filterTagsByType(4), "sedang mencari");
        return {
            creator: filterTagsByType(1),
            character: filterTagsByType(4),
            from: filterTagsByType(3),
            genre: filterTagsByType(0)
        };

    } catch (e) {
        console.error(e);
        return {
            creator: [],
            character: [],
            from: [],
            genre: []
        };
    } finally {
        inFetchTagsContinue = false;
    }
};
