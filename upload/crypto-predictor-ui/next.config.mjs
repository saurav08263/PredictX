/** @type {import('next').NextConfig} */
const isMobile = process.env.BUILD_TARGET === "mobile"

const nextConfig = {
  // When building for Capacitor (Android/iOS), export a fully static site to ./out
  ...(isMobile ? { output: "export" } : {}),
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
