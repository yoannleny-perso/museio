import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@museio/ui", "@museio/domain", "@museio/types", "@museio/validation"]
};

export default nextConfig;
