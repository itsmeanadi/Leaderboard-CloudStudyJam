import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable react strict mode for development
  reactStrictMode: true,
  
  // Enable compression for production
  compress: true,
  
  // Enable powered by header removal for security
  poweredByHeader: false,
  
  // Enable ETag generation for efficient caching
  generateEtags: true,
  
  // Configure trailing slash behavior
  trailingSlash: false,
  
  // Enable image optimization
  images: {
    // Add domains for image optimization if needed
    // domains: ['example.com'],
  },
  
  // Enable experimental features if needed
  experimental: {
    // Enable Turbopack for faster builds (already enabled via CLI)
    // turbotrace: true,
  },
  
  // Environment variables
  env: {
    // Add any server-side environment variables here
  },
};

export default nextConfig;
