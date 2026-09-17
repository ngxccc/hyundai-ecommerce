import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";

export const generateStaticParams = () => {
  return routing.locales.map((locale) => ({ locale }));
};

// this page will show when url is invalid
const CatchAllPage = () => {
  notFound();
};

export default CatchAllPage;
