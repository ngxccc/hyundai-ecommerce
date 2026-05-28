"use client";

import { useTranslations } from "next-intl";
import { Card } from "@nhatnang/ui/components/ui/card";
import { Button } from "@nhatnang/ui/components/ui/button";
import Image from "next/image";

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Máy phát điện Hyundai HY-30CLE",
    sold: 124,
    price: "12.5M",
    image:
      "https://lh3.googleusercontent.com/aida/ADBb0ujrKrYjkvwBEfZbnHqw9u8a1FmVqM15uso1_FwugYO17JpqRoLaOTwQYQ18y3cc3tbLSsWBQJeYmO83k2XdzPg3sNT3nzLGfMuX4lkUw99A5ZJUvMWc_tP-1ZUoQwhh8lnmmuNCq5zrutCGeDrIoS6G8QD-JMvbPSgtSo60v41eK-3vhfgM4Rggk4v4lOroAjc2M28urHu8u5LBYZJveVJomYFsVtJUi5VfkTmxR2r9uPIbD9n8-EuSnTs",
  },
  {
    id: 2,
    name: "Máy phát điện Hyundai HY-7000LE",
    sold: 98,
    price: "18.2M",
    image:
      "https://lh3.googleusercontent.com/aida/ADBb0uiEofozhVBjaQKjaaDCdfED5yGOy0Fi7b-6WP_KEKIASb_VFXf2Hq0w8CaOBw9DZAxl9iLfO2AwFnnmRAa3WbGna__1hEIrHXU6FTq11e5902WfvvwQp6z965mAdhOkyAwPIPvHn4ebF3TUsQyrGzjukT_WMb4RUUzj2TMXztix4lWubESeIt6Qllwl8sG7AR1qVBzmsxEtQRMsBgfzaDXVUsTsWYzhrjbo6onHKC50UbCNdLsSaH_mIQ",
  },
  {
    id: 3,
    name: "Trạm sạc dự phòng HPgreen",
    sold: 75,
    price: "8.5M",
    image:
      "https://lh3.googleusercontent.com/aida/ADBb0uh3KrEQ7cB4fhGte7hPVB-pEj7oHMh4u9Hnkbr_MR-jiD1P86Rv05biGc_nDUdXHeKspk9XJPpzQHgA8zCwVKnKJPT8FI5X7Uvi3EEImZNCFBHUE7qSCPWuxz8i5_YNrnx6bR6s5rKBgP9m4esGkZIpRSpKPwO-yfUxYnPyXAFgZ_dcA9TTfABTpFUkeyZosKf9BwhDnbG7KQmaUZLWY2UbMliRvDTYlviOZ_dFLVRXw1pK68Lg7NXhVnM",
  },
  {
    id: 4,
    name: "Máy phát điện Mitsubishi",
    sold: 42,
    price: "45.0M",
    image:
      "https://lh3.googleusercontent.com/aida/ADBb0ug1A4XHfFD1l5VZ8cPQseIVGqrxh0hrsJtTMmuKSBjf5bn4wrQIi0Ct51ZeH0t0BUnwQwqYqFvbdAKSi1--u6MgulTFU-xYMicysaESB4i7yaXIpa26x3FYRRGprscwTzI-bDtf2b3hrmVLFIZNfXaI5e_MV2594YRy45GiQcMCBIIhm7PtVIeajGbXKGqDKoOslMVW9XQodlIkFjTami01lHQGLqHz_BOJNBOuRRO9CJOLhUTDY_Yi1w",
  },
];

export const TopProducts = () => {
  const t = useTranslations("AdminDashboard.topProducts");

  return (
    <Card className="flex h-full flex-col gap-0 p-3 shadow-sm">
      <div className="border-border/50 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <h3 className="text-primary text-xl font-semibold">{t("title")}</h3>
        <Button
          variant="link"
          className="text-primary px-0 text-sm font-medium"
        >
          {t("viewAll")}
        </Button>
      </div>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
        {MOCK_PRODUCTS.map((product) => (
          <div
            key={product.id}
            className="hover:bg-muted flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors"
          >
            <div className="border-border/50 bg-muted relative h-12 w-12 shrink-0 overflow-hidden rounded border">
              <Image
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
                sizes="48px"
                fill
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-foreground truncate text-sm font-medium">
                {product.name}
              </h4>
              <p className="text-muted-foreground text-xs">
                {t("sold", { count: String(product.sold) })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-primary text-sm font-bold">{product.price}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
