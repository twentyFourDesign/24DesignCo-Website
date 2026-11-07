import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import StickyBar from "@/components/StickyBar";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const sora = Sora({ variable: "--font-sora", subsets: ["latin"], weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  title: "24 Design Co. | Mobile and web app development in Lagos",
  description:
    "We help founders turn ideas into working mobile and web apps, then stay on as their technical partner. Book a free idea review.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="antialiased">
        <Header />
        {children}
        <StickyBar />
      </body>
    </html>
  );
}
