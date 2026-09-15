export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface Product {
  id: string;
  model: string;
  name: string;
  specs: string[];
  price: number;
  imageUrl: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  imageUrl: string;
  description: string;
}

export interface PromoCampaign {
  id: string;
  badge: string; // E.g. "Flash Sale"
  title: string; // E.g. "Black Friday"
  subtitle: string; // E.g. "Mega Discount"
  description: string; // E.g. "Buy 1 Get 1 Special Promotion"
  discount: string; // E.g. "-50%"
  ctaText: string; // E.g. "Shop Now"
  ctaLink: string; // E.g. "/collections/black-friday"
  isActive: boolean;
  themeColor: string; // Hex color code for banner theme styling
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  imageUrl: string;
  slug: string;
}
