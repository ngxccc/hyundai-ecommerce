export interface DashboardMetrics {
  totalRevenue: number | string;
  totalOrders: number;
  totalProducts: number;
  newCustomers: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth?: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface TopSellingProduct {
  id: string;
  name?: string;
  nameVi?: string;
  nameEn?: string | null;
  salesCount?: number;
  sold?: number;
  revenue?: string;
  price?: string;
  image?: string;
}
