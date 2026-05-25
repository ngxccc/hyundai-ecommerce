"use client";

import { ProductCard, type ProductProps } from "./product-card";

const MOCK_PRODUCTS: ProductProps[] = [
  {
    id: "1",
    name: "Máy phát điện Hyundai HY-30CLE",
    sku: "HY30CLE",
    category: "Máy phát điện",
    stock: 15,
    price: "12.500.000 đ",
    status: "active",
    isQuoteOnly: false,
    image:
      "https://lh3.googleusercontent.com/aida/ADBb0ujrKrYjkvwBEfZbnHqw9u8a1FmVqM15uso1_FwugYO17JpqRoLaOTwQYQ18y3cc3tbLSsWBQJeYmO83k2XdzPg3sNT3nzLGfMuX4lkUw99A5ZJUvMWc_tP-1ZUoQwhh8lnmmuNCq5zrutCGeDrIoS6G8QD-JMvbPSgtSo60v41eK-3vhfgM4Rggk4v4lOroAjc2M28urHu8u5LBYZJveVJomYFsVtJUi5VfkTmxR2r9uPIbD9n8-EuSnTs",
  },
  {
    id: "2",
    name: "Máy phát điện Hyundai HY7000LE",
    sku: "HY7000LE",
    category: "Máy phát điện",
    stock: 8,
    price: "24.800.000 đ",
    status: "active",
    isQuoteOnly: false,
    image:
      "https://lh3.googleusercontent.com/aida/ADBb0uiEofozhVBjaQKjaaDCdfED5yGOy0Fi7b-6WP_KEKIASb_VFXf2Hq0w8CaOBw9DZAxl9iLfO2AwFnnmRAa3WbGna__1hEIrHXU6FTq11e5902WfvvwQp6z965mAdhOkyAwPIPvHn4ebF3TUsQyrGzjukT_WMb4RUUzj2TMXztix4lWubESeIt6Qllwl8sG7AR1qVBzmsxEtQRMsBgfzaDXVUsTsWYzhrjbo6onHKC50UbCNdLsSaH_mIQ",
  },
  {
    id: "3",
    name: "Trạm sạc HPGreen HPG1000L",
    sku: "HPG1000L",
    category: "Trạm sạc",
    stock: 0,
    price: "8.500.000 đ",
    status: "outOfStock",
    isQuoteOnly: false,
    image:
      "https://lh3.googleusercontent.com/aida/ADBb0uh3KrEQ7cB4fhGte7hPVB-pEj7oHMh4u9Hnkbr_MR-jiD1P86Rv05biGc_nDUdXHeKspk9XJPpzQHgA8zCwVKnKJPT8FI5X7Uvi3EEImZNCFBHUE7qSCPWuxz8i5_YNrnx6bR6s5rKBgP9m4esGkZIpRSpKPwO-yfUxYnPyXAFgZ_dcA9TTfABTpFUkeyZosKf9BwhDnbG7KQmaUZLWY2UbMliRvDTYlviOZ_dFLVRXw1pK68Lg7NXhVnM",
  },
  {
    id: "4",
    name: "Máy phát điện công nghiệp Mitsubishi",
    sku: "MITSUBISHI-IND",
    category: "Máy công nghiệp",
    stock: 2,
    price: "0 đ",
    status: "active",
    isQuoteOnly: true,
    image:
      "https://lh3.googleusercontent.com/aida/ADBb0ug1A4XHfFD1l5VZ8cPQseIVGqrxh0hrsJtTMmuKSBjf5bn4wrQIi0Ct51ZeH0t0BUnwQwqYqFvbdAKSi1--u6MgulTFU-xYMicysaESB4i7yaXIpa26x3FYRRGprscwTzI-bDtf2b3hrmVLFIZNfXaI5e_MV2594YRy45GiQcMCBIIhm7PtVIeajGbXKGqDKoOslMVW9XQodlIkFjTami01lHQGLqHz_BOJNBOuRRO9CJOLhUTDY_Yi1w",
  },
];

export const ProductGrid = () => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {MOCK_PRODUCTS.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
