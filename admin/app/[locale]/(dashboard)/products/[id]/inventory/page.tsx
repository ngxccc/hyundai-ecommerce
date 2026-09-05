import { getTranslations } from "next-intl/server";
import { api } from "@/lib/api-client";
import { notFound } from "next/navigation";
import { ProductHeader } from "@/features/products/components";
import { AdminBreadcrumbs } from "@/shared/components/admin-breadcrumbs";
import { ProductInventoryTable } from "@/features/products/components/product-inventory-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ProductInventoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [productRes, t, tNav, warehousesRes, warehouseStocksRes] =
    await Promise.all([
      api.GET("/products/{id}", { params: { path: { id } } }),
      getTranslations("AdminInventory"),
      getTranslations("AdminDashboard.nav"),
      api.GET("/warehouses"),
      api.GET("/warehouses/stock/product/{productId}", {
        params: { path: { productId: id } },
      }),
    ]);
  const product = productRes.data?.data;
  const warehouses = warehousesRes.data?.data ?? [];
  const warehouseStocks = warehouseStocksRes.data?.data ?? [];

  if (!product) {
    notFound();
  }

  return (
    <>
      <ProductHeader
        title={t("title")}
        description={t("description", { name: product.nameVi })}
        showAddButton={false}
      />
      <div className="flex-1 space-y-4 p-2">
        <div className="mx-auto">
          <div className="bg-background/80 sticky top-15 z-30 mb-2 flex w-full items-center justify-between rounded-none py-2 backdrop-blur-md sm:top-20 sm:pt-1 sm:pb-2">
            <div className="hidden flex-1 sm:block">
              <AdminBreadcrumbs
                items={[
                  { label: tNav("overview"), href: "/" },
                  { label: tNav("products"), href: "/products" },
                  {
                    label: product.nameVi,
                    href: `/products/${product.id}/edit`,
                  },
                  { label: t("title") },
                ]}
              />
            </div>
          </div>

          <Card className="py-4">
            <CardHeader className="px-4">
              <CardTitle>{t("tableTitle")}</CardTitle>
              <CardDescription>{t("tableDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="px-4">
              <ProductInventoryTable
                productId={product.id}
                warehouses={warehouses}
                warehouseStocks={warehouseStocks}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
