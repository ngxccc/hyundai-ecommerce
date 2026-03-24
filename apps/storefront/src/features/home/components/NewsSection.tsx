import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Button } from "@/shared/components/ui/button";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Link } from "@/i18n/routing";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { newsService } from "@/shared/services/news.service";

export async function NewsSection() {
  const t = await getTranslations("HomePage.news");

  const articles = await newsService.getLatest();

  if (!articles.length) return null;

  return (
    <section className="bg-background pt-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 border-b pb-6 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-display text-foreground text-4xl font-extrabold tracking-tighter uppercase">
              {t("title")}
            </h2>
            <p className="text-muted-foreground mt-2 font-sans text-sm tracking-widest uppercase">
              {t("subtitle")}
            </p>
          </div>

          <Button variant="outline" className="group" asChild>
            <Link href="/news">
              {t("viewAll")}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {articles.map((article) => (
            <Card
              key={article.id}
              className="group hover:border-primary/40 overflow-hidden p-0 transition-all hover:shadow-lg"
            >
              <article className="flex h-full flex-col sm:flex-row">
                <CardHeader className="relative aspect-4/3 shrink-0 p-0 sm:aspect-auto sm:w-2/5">
                  <Image
                    alt={article.title}
                    src={article.imageUrl}
                    fill
                    sizes="(max-width: 640px) 100vw, 300px"
                    className="object-cover transition-transform duration-700"
                  />
                  <Badge className="bg-background/80 text-foreground hover:bg-background/90 absolute top-4 left-4 text-[12px] backdrop-blur-sm">
                    {article.category}
                  </Badge>
                </CardHeader>

                {/* Vùng Nội dung */}
                <div className="flex flex-1 flex-col">
                  <CardContent className="grow p-6 pb-2">
                    <Link href={`/news/${article.slug}`}>
                      <h3 className="font-display text-foreground group-hover:text-primary mb-2 line-clamp-2 text-xl leading-tight font-bold transition-colors">
                        {article.title}
                      </h3>
                    </Link>
                    <p className="text-muted-foreground line-clamp-3 text-sm">
                      {article.description}
                    </p>
                  </CardContent>

                  {/* Vùng Footer */}
                  <CardFooter className="mt-auto px-6 pt-0 pb-6">
                    <div className="text-muted-foreground flex items-center text-xs font-medium">
                      <CalendarDays className="mr-2 h-3.5 w-3.5" />
                      {article.date}
                    </div>
                  </CardFooter>
                </div>
              </article>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
