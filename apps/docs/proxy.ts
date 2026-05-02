import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isMarkdownPreferred, rewritePath } from "fumadocs-core/negotiation";
import { docsContentRoute, docsRoute } from "@/lib/shared";

const rewriteDocsObj = rewritePath(
  `${docsRoute}{/*path}`,
  `${docsContentRoute}{/*path}/content.md`,
);
const rewriteDocs = (path: string) => rewriteDocsObj.rewrite(path);

const rewriteSuffixObj = rewritePath(
  `${docsRoute}{/*path}.mdx`,
  `${docsContentRoute}{/*path}/content.md`,
);
const rewriteSuffix = (path: string) => rewriteSuffixObj.rewrite(path);

export default function proxy(request: NextRequest) {
  const result = rewriteSuffix(request.nextUrl.pathname);
  if (result) {
    return NextResponse.rewrite(new URL(result, request.nextUrl));
  }

  if (isMarkdownPreferred(request)) {
    const result = rewriteDocs(request.nextUrl.pathname);

    if (result) {
      return NextResponse.rewrite(new URL(result, request.nextUrl));
    }
  }

  return NextResponse.next();
}
