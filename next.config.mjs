/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        CACHE_BUSTER: process.env.CACHE_BUSTER,
    },

    output: "standalone",
    async rewrites() {
        // Usar variável de ambiente para definir o backend URL
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        console.log('[next.config.js] Build/Server-side NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
        
        return [
            {
                source: '/backend/:path*',
                destination: `${backendUrl}/backend/:path*`, // Proxy para o backend
            },
        ]
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Credentials', value: 'true' },
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
                    { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
                ],
            },
        ]
    },
};

export default nextConfig;
