import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   experimental: {
    // @ts-expect-error: outputFileTracingIgnores is not in type definitions yet
    outputFileTracingIgnores: ['./lib/generated/prisma/**/*'],
  },
};

export default nextConfig;
