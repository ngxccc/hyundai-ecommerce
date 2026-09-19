import { notFound } from "next/navigation";

// Next.js 16 Cache Components: Allow catch-all route to opt out of instant prerender
export const instant = false;

export default function CatchAllPage() {
  notFound();
}
