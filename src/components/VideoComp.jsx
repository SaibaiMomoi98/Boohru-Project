// VideoComp.js
import React from 'react';

const VideoComp = ({ source }) => {
    const proxyUrl = `/proxies?url=${source}`;

    return (
        <video controls width="600">
            <source src={proxyUrl} type="video/mp4" />
            Your browser does not support the video tag.
        </video>
    );
};

export default VideoComp;
