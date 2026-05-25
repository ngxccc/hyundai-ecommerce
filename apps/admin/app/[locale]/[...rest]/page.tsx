import { notFound } from "next/navigation";

export const revalidate = 3600;

// this page will show when url is invalid
export const CatchAllPage = () => {
  notFound();
};

export default CatchAllPage;
