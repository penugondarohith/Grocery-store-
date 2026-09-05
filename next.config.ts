import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // /product/[id] used to be the route — now [slug] is canonical
      // Both folders exist due to OneDrive sync, so we keep [id] as a passthrough
    ];
  },

  // Allow Prisma (from backend) to run in Next.js API routes
  serverExternalPackages: ['@prisma/client', 'prisma'],

  // Allow images from Supabase storage, Unsplash, and Google
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
