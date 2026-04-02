import type { NextConfig } from "next";

import { isGithubPagesBuild, siteBasePath } from "./lib/site-config";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isGithubPagesBuild
    ? {
        output: "export",
        trailingSlash: true,
        basePath: siteBasePath,
        assetPrefix: `${siteBasePath}/`,
        images: {
          unoptimized: true,
        },
      }
    : {}),
};

export default nextConfig;
