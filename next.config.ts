import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // cacheComponents and partialPrefetching removed — these experimental flags
  // cause strict prerender errors with Date.now(), new Date(), cookies(), etc.
  // and are not needed for production stability.
};

export default nextConfig;
