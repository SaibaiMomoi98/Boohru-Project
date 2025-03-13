import Link from "next/link";

export default function RenderTags({ relativeTags }) {
    const renderTags = (tagsArray, colorClass) => {
        return tagsArray.map((item, index) => (
            <Link
                key={index}
                href={`/post?s=${encodeURIComponent(item.name)}&p=1`}
                className={`h-[4vh] flex flex-row items-center rounded-lg p-1 text-center hover:bg-pink-600 hover:cursor-pointer ${colorClass}`}
            >
                <span className="text-[10px]">{item?.name.split("_").join(" ")}</span>
            </Link>
        ));
    };

    const renderRelativeTags = () => {
        const tagComponents = [];

        for (const [key, value] of Object.entries(relativeTags)) {
            const colorClass = {
                creator: "bg-green-400 text-green-900",
                character: "bg-red-400 text-red-900",
                from: "bg-cyan-400 text-blue-900",
                genre: "bg-pink-400 text-pink-900"
            }[key];

            const tagsToRender = value.length > 35 ? value.slice(0, 35) : value;
            tagComponents.push(renderTags(tagsToRender, colorClass));
        }

        return tagComponents;
    };

    return <div className="flex flex-wrap gap-2">{renderRelativeTags()}</div>;
}
