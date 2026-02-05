/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vwbrvxkzjwpppagkpipf.supabase.co',
      },
    ],
  },
  async redirects() {
    return [
      // Redirect www to non-www (handled at Vercel level, but fallback here)
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.corridor.gent',
          },
        ],
        destination: 'https://corridor.gent/:path*',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
