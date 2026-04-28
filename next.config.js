// next.config.js
/** @type {import('next').NextConfig} */ // This line provides helpful type checking
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.ufs.sh',
        port: '',
        pathname: '/**',
      },
      // Hybrid state: legacy assets still served from Firebase Storage.
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // other configurations... (ensure you don't overwrite other important settings)
};

module.exports = nextConfig;