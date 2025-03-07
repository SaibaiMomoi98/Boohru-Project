import type { NextConfig } from "next";
import { withNextVideo } from 'next-video/process';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  /* config options here */
        env: {
            AUTH_SECRET: process.env.AUTH_SECRET,
        },

    images: {
        domains: ['img3.gelbooru.com', 'gelbooru.com','video-cdn1.gelbooru.com']
    },

};

export default withNextVideo(nextConfig);
