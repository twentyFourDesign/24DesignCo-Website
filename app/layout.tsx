import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import Header, { HeaderView } from "@/components/Header";
import StickyBar from "@/components/StickyBar";
import Script from "next/script";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import { getSiteSafe } from "@/lib/cms/site";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const sora = Sora({ variable: "--font-sora", subsets: ["latin"], weight: ["600", "700", "800"] });

export const viewport: Viewport = { themeColor: "#0F172A" };

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "48x48" }, { url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s`,
  },
  description:
    "We help founders turn ideas into working mobile and web apps, then stay on as their technical partner. Book a free idea review.",
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: SITE_URL,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getSiteSafe();
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <head>{site.searchConsole ? <meta name="google-site-verification" content={site.searchConsole} /> : null}</head>
      <body className="antialiased">
        <Suspense fallback={<HeaderView navigation={site.navigation} button={site.navButton} path="" />}>
          <Header navigation={site.navigation} button={site.navButton} />
        </Suspense>
        {children}
        <StickyBar label={site.navButton.label} url={site.navButton.url} />
        {site.gaId && /^[A-Za-z0-9-]+$/.test(site.gaId) && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${site.gaId}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${site.gaId}');`}</Script>
          </>
        )}
      </body>
    </html>
  );
}
