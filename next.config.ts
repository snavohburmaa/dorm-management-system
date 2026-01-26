import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Helps on macOS setups that hit EMFILE (too many open files).
  watchOptions: {
    pollIntervalMs: 1000,
  },
};

export default nextConfig;
