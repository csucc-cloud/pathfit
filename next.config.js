/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This ensures that even if a user visits the root '/', 
  // they are sent to the login or practicum page.
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: true,
      },
    ];
  },
  // Optional: If you use external images (like Google Profile pics)
  images: {
    domains: ['lh3.googleusercontent.com', 'www.gstatic.com'],
  },
}

module.exports = nextConfig
