/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@dismart/shared"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
