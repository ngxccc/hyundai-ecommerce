export interface NextPageProps<T = { slug: string }> {
  params: Promise<T>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export interface DocsSlugParams {
  slug?: string[];
}

export type DocsPageProps = NextPageProps<DocsSlugParams>;
