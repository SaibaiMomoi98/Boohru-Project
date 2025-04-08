import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {useRouter} from "next/navigation";

export default function RenderTags({ relativeTags }) {
    const router = useRouter()
    const [activeFilter, setActiveFilter] = useState(null);
    const [contextMenu, setContextMenu] = useState({
        show: false,
        position: { x: 0, y: 0 },
        currentTag: null,
    });
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setContextMenu({ ...contextMenu, show: false });
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [contextMenu]);

    const renderTags = (tagsArray, colorClass, selectedColor) => {
        return tagsArray.map((item, index) => (
            <div key={index} className="relative inline-block">
                <button
                    onClick={(e) => {
                        const rect = e.target.getBoundingClientRect();
                        setContextMenu({
                            show: true,
                            position: { x: rect.left, y: rect.bottom + window.scrollY },
                            currentTag: item.name,
                        });
                    }}
                    className={`h-[4vh] flex flex-row items-center rounded-lg p-1 text-center hover:cursor-pointer ${contextMenu.show && contextMenu.currentTag === item.name ? selectedColor : colorClass}`}
                >
                    <span className="text-[10px]">{item?.name.split("_").join(" ")}</span>
                </button>
            </div>
        ));
    };

    const handleChangePage = (tags) => {
        // e.preventDefault();
        router.push(`/post?s=${encodeURIComponent(tags)}&p=1`);
    }

    const handleFilterClick = (filterType) => {
        setActiveFilter(activeFilter === filterType ? null : filterType);
        setContextMenu({ ...contextMenu, show: false });
    };

    const handleSearchAction = (action) => {
        console.log(`${action} tag: ${contextMenu.currentTag}`);
        setContextMenu({ ...contextMenu, show: false });
    };

    const colorClasses = {
        creator: "bg-green-400 text-green-900 hover:bg-green-600 hover:text-white",
        character: "bg-red-400 text-red-900 hover:text-white hover:bg-red-600",
        from: "bg-cyan-400 text-blue-900 hover:text-white hover:bg-cyan-600",
        genre: "bg-pink-400 text-pink-900 hover:text-white hover:bg-pink-600",
    };

    const selectedColorClass = {
        creator: "bg-green-600 text-white",
        character: "text-white bg-red-600",
        from: "text-white bg-cyan-600",
        genre: "text-white bg-pink-600"
    }

    return (
        <div className="flex flex-row max-md:justify-center flex-wrap gap-2">
            <div className="flex flex-row flex-wrap gap-2 justify-center items-center">
                <button
                    onClick={() => handleFilterClick("creator")}
                    className={`h-[4vh] flex flex-row items-center rounded-lg p-1 text-center text-[10px] font-bold ${
                        activeFilter === "creator"
                            ? "bg-green-900 text-white"
                            : "bg-green-400 text-green-900"
                    }`}
                >
                    Artist
                </button>
                <button
                    onClick={() => handleFilterClick("from")}
                    className={`h-[4vh] flex flex-row items-center rounded-lg p-1 text-center text-[10px] font-bold ${
                        activeFilter === "from"
                            ? "bg-cyan-600 text-white"
                            : "bg-cyan-400 text-blue-900"
                    }`}
                >
                    Shows/Games
                </button>
                <button
                    onClick={() => handleFilterClick("character")}
                    className={`h-[4vh] flex flex-row items-center rounded-lg p-1 text-center text-[10px] font-bold ${
                        activeFilter === "character"
                            ? "bg-red-600 text-white"
                            : "bg-red-400 text-red-900"
                    }`}
                >
                    Characters
                </button>
                <button
                    onClick={() => handleFilterClick("genre")}
                    className={`h-[4vh] flex flex-row items-center rounded-lg p-1 text-center text-[10px] font-bold ${
                        activeFilter === "genre"
                            ? "bg-pink-600 text-white"
                            : "bg-pink-400 text-pink-900"
                    }`}
                >
                    Genre & Other
                </button>
            </div>
            <div className="h-[2px] bg-pink-400 w-full my-4"></div>

            {activeFilter ? (
                <>
                  {renderTags(
                      relativeTags[activeFilter].slice(0, 80),
                      colorClasses[activeFilter],
                      selectedColorClass[activeFilter],
                  )}
                </>
            ) : (
                <>
                    {Object.entries(relativeTags).map(([key, value]) =>
                        renderTags(
                            value.length > 35 ? value.slice(0, 35) : value,
                            colorClasses[key],
                            selectedColorClass[key],
                        )
                    )}
                </>
            )}

            {/* Context Menu */}
            {contextMenu.show && (
                <div
                    ref={menuRef}
                    className="absolute z-50 bg-white shadow-lg rounded-md p-2 border border-gray-200"
                    style={{
                        top: `${contextMenu.position.y}px`,
                        left: `${contextMenu.position.x}px`,
                    }}
                >
                    <button className="text-xs font-semibold mb-1 px-2 py-1" onClick={() => handleChangePage(contextMenu.currentTag)}>
                        {contextMenu.currentTag?.split("_").join(" ")}
                    </button>
                    <button
                        onClick={() => handleSearchAction("add")}
                        className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-xs flex items-center"
                    >
                        <span className="mr-2">+</span> Add to search
                    </button>
                    <button
                        onClick={() => handleSearchAction("subtract")}
                        className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-xs flex items-center"
                    >
                        <span className="mr-2">-</span> Exclude from search
                    </button>
                    <Link
                        href={`/wiki?term=${encodeURIComponent(contextMenu.currentTag)}`}
                        className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-xs flex items-center"
                    >
                        <span className="mr-2">?</span> Wiki info
                    </Link>
                </div>
            )}
        </div>
    );
}