/** @type {import('next').NextConfig} */
export default {
  async redirects() {
    return [{ source: '/mapa', destination: '/mapa/index.html', permanent: false }];
  },
  async headers() {
    return [
      { source: '/mapa/data/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }] },
      { source: '/video/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=604800' }] },
    ];
  },
};
