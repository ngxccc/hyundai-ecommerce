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
