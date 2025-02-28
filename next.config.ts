import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
        env: {
            AUTH_SECRET: process.env.AUTH_SECRET,
        },

    images: {
        domains: ['img3.gelbooru.com', 'gelbooru.com']
    },


};

export default nextConfig;
