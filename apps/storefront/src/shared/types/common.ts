export interface Product {
  id: string;
  model: string;
  name: string;
  specs: string[];
  price: number;
  imageUrl: string;
}

export interface ProductsResponse {
  status: boolean;
  data: Product[];
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  imageUrl: string;
  description: string;
}

export interface CategoriesResponse {
  status: boolean;
  data: Category[];
}

export interface PromoCampaign {
  id: string;
  badge: string; // VD: "Flash Sale"
  title: string; // VD: "Black Friday"
  subtitle: string; // VD: "Sập Sàn"
  description: string; // VD: "Mua 1 tặng 1..."
  discount: string; // VD: "-50%"
  ctaText: string; // VD: "Săn ngay"
  ctaLink: string; // VD: "/collections/black-friday"
  isActive: boolean;
  themeColor: string; // Nâng cao: CMS có thể trả về màu primary luôn!
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}
