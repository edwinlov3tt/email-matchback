/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@matchback/types', '@matchback/utils'],
}

module.exports = nextConfig
