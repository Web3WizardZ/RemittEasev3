// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // This will allow the build to continue despite ESLint warnings
  },
  typescript: {
    ignoreBuildErrors: false, // Keep this false to catch actual TypeScript errors
  },
  images: {
    domains: ['assets.moonpay.com'], // Add any domains you're loading images from
  },
}

module.exports = nextConfig