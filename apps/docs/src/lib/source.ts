import { loader } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";
import { docsContentRoute, docsImageRoute, docsRoute } from "./shared";
import { docs } from "collections/server";

const fumadocsSource = docs.toFumadocsSource();

export const source = loader(fumadocsSource, {
  baseUrl: docsRoute,
  // source: fumadocsSource,
  plugins: [lucideIconsPlugin()],
});

export function getPageImage(page: (typeof source)["$inferPage"]) {
  const segments = [...page.slugs, "image.png"];

  return {
    segments,
    url: `${docsImageRoute}/${segments.join("/")}`,
  };
}

export function getPageMarkdownUrl(page: (typeof source)["$inferPage"]) {
  const segments = [...page.slugs, "content.md"];

  return {
    segments,
    url: `${docsContentRoute}/${segments.join("/")}`,
  };
}

export async function getLLMText(page: (typeof source)["$inferPage"]) {
  const dataWithPatch = page.data as typeof page.data & {
    getText: (key: string) => Promise<string>;
  };

  // Mượt mà, hết báo đỏ!
  const processed = await dataWithPatch.getText("processed");

  return `# ${page.data.title} (${page.url})

${processed}`;
}
