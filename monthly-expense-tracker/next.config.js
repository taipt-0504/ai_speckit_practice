/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    strictNullChecks: true,
    alwaysStrict: true,
  },
  eslint: {
    dirs: ['app', 'components', 'lib', 'types'],
  },
};

module.exports = nextConfig;
