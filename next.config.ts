import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force Turbopack to use the current directory as root.
  // This avoids the panic caused by non-ASCII chars (e.g. "Á") in the path.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
