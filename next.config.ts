import type { NextConfig } from "next";

/**
 * Old addresses from the previous 24group.com.ng site, sent permanently to the closest new page so links and rankings carry over.
 * /web-development and /portfolio come from the old site; the rest follow its service names. Add any others that Search Console
 * reports as "Not found (404)" here, one line each.
 */
const OLD_URLS: [string, string][] = [
  ["/web-development", "/services"],
  ["/web-app-development", "/services"],
  ["/mobile-app-development", "/services"],
  ["/ios-app-development", "/services"],
  ["/android-app-development", "/services"],
  ["/flutter-app-development", "/services"],
  ["/ui-ux-design", "/services"],
  ["/devops", "/services"],
  ["/software-testing", "/services"],
  ["/dedicated-team", "/services"],
  ["/legacy-software-modernization", "/services/cto-as-a-service"],
  ["/discovery-phase", "/services/discovery-sprint"],
  ["/discovery-sprint", "/services/discovery-sprint"],
  ["/mvp-development", "/services/mvp-development"],
  ["/cto-as-a-service", "/services/cto-as-a-service"],
  ["/portfolio", "/our-work"],
  ["/projects", "/our-work"],
  ["/case-studies", "/our-work"],
  ["/about-us", "/about"],
  ["/contact-us", "/contact"],
  ["/book", "/contact"],
  ["/blogs", "/blog"],
  ["/insights", "/blog"],
  ["/privacy-policy", "/privacy"],
];

const nextConfig: NextConfig = {
  async redirects() {
    return OLD_URLS.map(([source, destination]) => ({ source, destination, permanent: true }));
  },
  // A self-contained server in .next/standalone, for hosts such as cPanel (Vercel ignores it).
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
