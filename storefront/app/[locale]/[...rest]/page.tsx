import { notFound } from "next/navigation";

// this page will show when url is invalid
export default async function CatchAllPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  notFound();
}
