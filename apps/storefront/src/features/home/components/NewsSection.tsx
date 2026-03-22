"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

export function NewsSection() {
  const t = useTranslations("HomePage");

  const articles = [
    {
      key: "article1" as const,
      imageSrc:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDoYlmcln5OMZhw4eD3BervSbY8JmKVpGTRLxVQsGLIm0N06hdaqk8h2J91vs-oNpNPxB5YiT2cXaxfzvastmrqscJi5HeU2HJHibR3LSCTCrA4HZNR1gE8091SM5N1UaNmfguf4nx8CeiN2aE54eSv-18QAFXPfEOTvbpSj3LUBZS22EjBqX1CIxbziNun1mIYIpmWZkwra1BZbw4TT_vQ6NWpWqeY_HTnuIHogOvFt58kQ9wLQUk8WOYm9fExbUDaZyjAUf3dqZX0",
    },
    {
      key: "article2" as const,
      imageSrc:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDjIxCA4XVZTjeNRs_JDa-D5z6yFOZpLwNdw8kZ_vP0QiqxH9NWFPj0S-xocoBFJ8UNgEj-4vY9KX16EU6Ciph1ye8Xj20DZw7NirIJvI_zQrknUtNwloyRHuPMjzXoWibhi5QByb1dwXLqZHknLoPKeDiJnzP98SSJDE89qnTlQlOuh1eTXfNBpy0XhfKh8zLmhQ8fc4dryEOqDmXNBdkF-U_jXdvm1LV3ug4vK_pby1AyI706lvyHjX_5i-9wxfsJPBNK5gwY3yUz",
    },
  ];

  return (
    <section className="bg-surface-container-low/50 py-24">
      <div className="mx-auto max-w-7xl px-8">
        <div className="mb-16 flex items-end justify-between">
          <div>
            <h2 className="font-headline text-on-surface text-4xl font-extrabold tracking-tighter uppercase">
              {t("news.title")}
            </h2>
            <p className="font-label text-primary/60 mt-2 tracking-widest uppercase">
              {t("news.subtitle")}
            </p>
          </div>
          <button className="font-headline border-primary border-b-2 pb-1 text-sm font-bold tracking-widest uppercase">
            {t("news.viewAll")}
          </button>
        </div>
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
          {articles.map((article) => (
            <article
              key={article.key}
              className="group flex flex-col items-start gap-8 md:flex-row"
            >
              <div className="bg-surface-container-highest h-48 w-full shrink-0 overflow-hidden rounded-lg md:w-48">
                <Image
                  alt={t(`news.${article.key}.title`)}
                  src={article.imageSrc}
                  width={200}
                  height={200}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div>
                <span className="font-label text-primary mb-2 block text-xs font-bold tracking-widest uppercase">
                  {t(`news.${article.key}.category`)}
                </span>
                <h3 className="font-headline text-on-surface group-hover:text-primary mb-4 text-2xl leading-tight font-bold transition-colors">
                  {t(`news.${article.key}.title`)}
                </h3>
                <p className="text-secondary font-body mb-4 line-clamp-2">
                  {t(`news.${article.key}.desc`)}
                </p>
                <span className="font-label text-outline text-[10px] tracking-widest uppercase">
                  {t(`news.${article.key}.date`)}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
