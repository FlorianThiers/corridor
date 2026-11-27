/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vwbrvxkzjwpppagkpipf.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig
