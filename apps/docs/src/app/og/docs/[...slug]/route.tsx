import { getPageImage, source } from "@/lib/source";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { generate as DefaultImage } from "fumadocs-ui/og";
import { appName } from "@/lib/shared";
import type { DocsPageProps } from "@/types/next";

export const revalidate = false;

export async function GET(_req: Request, { params }: DocsPageProps) {
  const { slug } = await params;

  if (!slug) notFound();

  const page = source.getPage(slug.slice(0, -1));

  if (!page) notFound();

  return new ImageResponse(
    <DefaultImage
      title={page.data.title}
      description={page.data.description}
      site={appName}
    />,
    {
      width: 1200,
      height: 630,
    },
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImage(page).segments,
  }));
}
