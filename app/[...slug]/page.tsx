// Rendering is blocking on purpose: the page path is only known per request, and a missing page should be a real 404.
export const instant = false;

import { Suspense } from "react";
import type { Metadata } from "next";
import CmsPage from "@/components/sections/CmsPage";
import { pageMetadata } from "@/lib/cms/pages";

// Pages created in the admin at paths the site does not already serve. Static routes (/services, /blog …) take priority.
const toPath = (slug: string[]) => "/" + slug.map((s) => decodeURIComponent(s).toLowerCase()).join("/");

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  return pageMetadata(toPath((await params).slug));
}

async function Inner({ params }: { params: Promise<{ slug: string[] }> }) {
  return <CmsPage path={toPath((await params).slug)} />;
}

export default function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  return <Suspense fallback={null}><Inner params={params} /></Suspense>;
}
