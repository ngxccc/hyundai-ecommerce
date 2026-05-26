import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export const generateStaticParams = () => {
  return routing.locales.map((locale) => ({ locale }));
};

// this page will show when url is invalid
export const CatchAllPage = () => {
  notFound();
};

export default CatchAllPage;
