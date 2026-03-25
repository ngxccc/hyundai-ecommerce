import { notFound } from "next/navigation";

// this page will show when url is invalid
export default function CatchAllPage() {
  notFound();
}
