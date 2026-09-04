export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  imageUrl: string;
  slug: string;
}

export interface PromoCampaign {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  discount: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  themeColor: string;
}
