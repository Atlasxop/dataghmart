import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    // Allow preview panel origins (space-z.ai)
    ".space-z.ai",
    "localhost",
    "127.0.0.1",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
    ],
  },
  // Expose server-side env vars to the client by aliasing them
  // This way PAYSTACK_PUBLIC_KEY on Vercel becomes available as NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
  env: {
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY:
      process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || process.env.PAYSTACK_PUBLIC_KEY || "",
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || process.env.PUBLIC_APP_URL || process.env.APP_URL || "",
  },
};

export default nextConfig;
