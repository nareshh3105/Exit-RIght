import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Mobile-first app — no static export needed for Supabase SSR
  experimental: {
    // Enable server actions
  },
};

export default nextConfig;
