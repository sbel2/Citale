/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "prod-files-secure.s3.us-west-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "qteefmlwxyvxjvehgjvp.supabase.co",
      },
      {
        protocol: "https",
        hostname: "supabase-image-cache.citaleco.workers.dev",
      },
    ],
  },
};

export default nextConfig;
