import withPWA from "next-pwa";

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = pwaConfig({
  output: "export",
  images: { unoptimized: true },
});

export default nextConfig;
