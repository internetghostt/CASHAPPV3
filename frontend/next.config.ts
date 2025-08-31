import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,  // Optional: Enables React Strict Mode for development
};

export default nextConfig;
