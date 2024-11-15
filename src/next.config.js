/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Add any required rewrites or redirects here
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  // Add image domains if needed
  images: {
    domains: ['your-domain.com'],
  },
}

module.exports = nextConfig