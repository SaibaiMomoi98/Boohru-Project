import React from 'react';
import {useRouter} from "next/navigation";

function RenderTags({relativeTags}) {
    const router = useRouter()
    const handleChangePage = (name) => {
        router.push(`/post?s=${name}&p=1`);
        router.refresh()
    }

    const renderTags = (tagsArray, colorClass) => {
        return tagsArray.map((item, index) => (
            <div key={index} onClick={() => handleChangePage(item.name)}
                 className={`h-[4vh] flex flex-row items-center rounded-lg p-1 text-center hover:bg-pink-600 hover:cursor-pointer ${colorClass}`}>
                <a className="text-[10px]">{item?.name.split("_").join(" ")}</a>
            </div>
        ));
    };

    const renderRelativeTags = () => {
        const tagComponents = [];

        // Check each key in relativeTags
        for (const [key, value] of Object.entries(relativeTags)) {
            const colorClass = {
                creator: "bg-green-400 text-green-900",
                character: "bg-red-400 text-red-900",
                from: "bg-cyan-400 text-blue-900",
                genre: "bg-pink-400 text-pink-900"
            }[key];

            // Slice if length is greater than 35
            const tagsToRender = value.length > 35 ? value.slice(0, 35) : value;

            // Push the rendered tags to the tagComponents array
            tagComponents.push(renderTags(tagsToRender, colorClass));
        }

        return tagComponents;
    };

    return renderRelativeTags()
}

export default RenderTags;