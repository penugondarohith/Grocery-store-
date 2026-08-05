import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Suppress the middleware→proxy deprecation warning for Next.js 16
  experimental: {},

  // Allow images from Supabase storage
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google OAuth avatars
      },
    ],
  },
};

export default nextConfig;
