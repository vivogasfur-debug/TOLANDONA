import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Allow cross-origin requests from preview domains
  allowedDevOrigins: [
    'preview-chat-37ce5563-ffba-4ebb-b141-ff8f9e5d919e.space-z.ai',
    '.space-z.ai',
    'localhost',
  ],
};

export default nextConfig;
