/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    async rewrites() {
        return [
            {
                source: '/backend/:path*',
                destination: 'http://localhost:8000/backend/:path*', // Proxy para o backend
            },
        ]
    },
};

export default nextConfig;
