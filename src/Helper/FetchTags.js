
export const fetchTags = async (data, s, prefStorage, idParams) => {
    try {
        // Collect raw tags from posts
        const rawTagsSet = data.post?.flatMap(el => el.tags ? el.tags.split(" ") : []) || [];
        const tagsSet = new Set(rawTagsSet);
        const arrayEncoded = [...tagsSet].map(item => encodeURIComponent(item));

        const MAX_TAGS = 900; // Set a limit for the number of tags
        const limitedTags = arrayEncoded.slice(0, MAX_TAGS); // Take only the first MAX_TAGS

        // Fetch tags from the API
        const fetchTagsFromApi = async (page = 0) => {
            if (s) {
                const response = await fetch(`/tags.json/?names=${limitedTags.join("+")}&limit=100&orderBy=count&order=desc&includeOffset=true&page=${page}`);return response.json();
           return response.json();
            }
            else if (data[0]?.id === Number(idParams) && data?.length === 1){
                const arrayEncoded = data[0]?.tags?.split(" ").map((item) => encodeURIComponent(item)).join("+")
                const response = await fetch(`/tags.json/?names=${arrayEncoded}&limit=${data[0]?.tags?.split(" ").length}&orderBy=count&order=desc&includeOffset=true&page=${page}`);
                console.log(`/tags.json/?names=${arrayEncoded}&limit=${data[0]?.tags?.split(" ").length}&orderBy=count&order=desc&includeOffset=true&page=${page}`)
                return response.json();
            }
            else if (!s) {
                const response = await fetch(`/tags.json/?limit=100&orderBy=count&order=desc&includeOffset=true&page=${page}`);
                return response.json();
            }
        };

        const initialData = await fetchTagsFromApi();
        console.log(initialData);
        let arrFullTags = initialData.tag || [];
        const attributesArr = initialData['@attributes'];

        // Fetch additional pages if necessary
        if (s) {
            if (initialData.tag?.length === 100) {
                const pageCountTags = Math.floor(Number(attributesArr.count) / Number(attributesArr.limit));
                const additionalPages = await Promise.all(
                    Array.from({length: pageCountTags}, (_, i) => fetchTagsFromApi(i + 2))
                );
                additionalPages.forEach(pageData => {
                    arrFullTags.push(...(pageData.tag || []));
                });
            }
        }

        const filterTagsByType = (type) => arrFullTags.filter(tag => tag.type === type);
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
    }
};
