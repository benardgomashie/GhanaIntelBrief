import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ['firebase', '@firebase/util', '@firebase/auth'],
  serverExternalPackages: ['@genkit-ai/google-genai', 'genkit'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@firebase/util': require.resolve('@firebase/util'),
      };
    } else {
      // Exclude server-only packages from client bundle
      config.resolve.alias = {
        ...config.resolve.alias,
        '@genkit-ai/google-genai': false,
        'genkit': false,
      };
    }
    
    // Ignore postinstall.mjs file
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    
    config.module = {
      ...config.module,
      exprContextCritical: false,
    };
    
    // Ignore genkit warnings
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /node_modules\/@genkit-ai/ },
      { module: /node_modules\/genkit/ },
    ];

    return config;
  },
};

export default nextConfig;
