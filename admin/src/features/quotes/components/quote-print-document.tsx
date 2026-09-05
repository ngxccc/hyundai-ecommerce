"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import {
  Printer,
  ArrowLeft,
  Zap,
  Cpu,
  ShieldCheck,
  Volume2,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { numberToVietnameseWords } from "@/shared/constants";
import type { ComplexQuote } from "@/shared/types/admin-schema.types";
import type { ProductSpecs } from "@/shared/validators";

export interface QuotePrintDocumentProps {
  quote: ComplexQuote;
}

export const QuotePrintDocument = ({ quote }: QuotePrintDocumentProps) => {
  const t = useTranslations("AdminQuotes");
  const translate = t as unknown as (
    key: string,
    params?: Record<string, unknown>,
  ) => string;
  const router = useRouter();

  const formatCurrency = (val: string | number | null | undefined) => {
    const num = typeof val === "string" ? parseFloat(val) : Number(val ?? 0);
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(isNaN(num) ? 0 : num);
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "---";
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const terms = quote.commercialTerms;
  const subtotal = parseFloat(quote.subtotalPrice ?? "0");
  const vatRate = quote.vatRate ?? 10;
  const vatAmount = parseFloat(quote.vatAmount ?? "0");
  const grandTotal = parseFloat(quote.totalQuotedPrice ?? "0");
  const amountInWords = numberToVietnameseWords(grandTotal);

  // Filter items with detailed technical specifications for Appendix (Phụ lục Kỹ thuật)
  const generatorItems = (quote.items ?? []).filter((item) => {
    const specs = item.product?.specs as ProductSpecs | undefined;
    const hasSpecs = specs ? Object.keys(specs).length > 0 : false;
    const hasItemSpecs = Boolean(item.itemSpecs);
    return hasSpecs || hasItemSpecs || !item.isCustomItem;
  });

  return (
    <div className="min-h-screen bg-slate-100 py-6 text-slate-900 print:bg-white print:p-0 print:text-black">
      {/* Print Specific CSS Rules */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              .no-print {
                display: none !important;
              }
              body {
                background: white !important;
                color: black !important;
                margin: 0 !important;
                padding: 0 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .quote-print-canvas {
                border: none !important;
                box-shadow: none !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                background: transparent !important;
              }
              .page-break-before {
                page-break-before: always !important;
                break-before: page !important;
              }
              .keep-together {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              table {
                page-break-inside: auto !important;
              }
              tr {
                page-break-inside: avoid !important;
                page-break-after: auto !important;
              }
              @page {
                size: A4 portrait;
                margin: 12mm 15mm 12mm 15mm;
              }
            }
          `,
        }}
      />

      {/* Floating Control Toolbar (Screen Only) */}
      <div className="no-print mx-auto mb-6 flex max-w-4xl items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/quotes/${quote.id}`)}
            className="gap-2 text-xs font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            {translate("printDocument.backToQuote")}
          </Button>

          <Badge variant="secondary" className="font-mono text-xs">
            {quote.quoteNumber || `#${quote.id.slice(0, 8)}`}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => window.print()}
            className="gap-2 text-xs font-semibold shadow-xs"
          >
            <Printer className="h-4 w-4" />
            {translate("printDocument.printButton")}
          </Button>
        </div>
      </div>

      {/* Document Sheet (A4 Canvas) */}
      <main className="quote-print-canvas mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12 print:rounded-none print:border-none print:p-0 print:shadow-none">
        {/* ========================================================================= */}
        {/* PAGE 1: CORPORATE HEADER & COMMERCIAL QUOTE                               */}
        {/* ========================================================================= */}

        {/* Top Header: Brand & Company Identity */}
        <header className="flex flex-col justify-between gap-6 border-b-2 border-slate-900 pb-6 sm:flex-row print:flex-row print:border-slate-900">
          <div className="flex max-w-md flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-wider text-blue-900 uppercase">
                HYUNDAI POWER PRODUCTS
              </span>
            </div>
            <p className="mt-1 text-xs font-bold tracking-wide text-slate-800 uppercase">
              CÔNG TY TNHH THIẾT BỊ CÔNG NGHỆ NHẬT NĂNG
            </p>
            <p className="text-[11px] leading-relaxed text-slate-600">
              Địa chỉ: 310/61 Đường Chiến Lược, P. Bình Trị Đông A, Q. Bình Tân,
              TP. HCM
              <br />
              Hotline:{" "}
              <span className="font-semibold text-slate-900">
                0901.49.7771
              </span>{" "}
              | Email: hyundaipowerproducts.vn@gmail.com
              <br />
              Mã số thuế:{" "}
              <span className="font-semibold text-slate-900">0316447814</span> |
              Website: https://hyundaipowerproducts.vn
            </p>
          </div>

          <div className="flex flex-col text-left sm:items-end sm:text-right print:items-end print:text-right">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">
              {translate("printDocument.quoteTitle")}
            </h1>
            <div className="mt-2 flex flex-col gap-1 text-xs font-medium text-slate-700">
              <span>
                {translate("printDocument.quoteNo")}:{" "}
                <strong className="font-mono font-bold text-slate-900">
                  {quote.quoteNumber || `#${quote.id.slice(0, 8)}`}
                </strong>
              </span>
              <span>
                {translate("printDocument.issueDate")}:{" "}
                {formatDate(quote.createdAt)}
              </span>
              <span>
                {translate("printDocument.validity")}:{" "}
                <strong>{terms?.validityDays ?? 15} ngày</strong> (đến ngày{" "}
                {formatDate(quote.expirationDate)})
              </span>
            </div>
          </div>
        </header>

        {/* Recipient / Customer Details */}
        <section className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs print:border-slate-300 print:bg-slate-50/50">
          <h2 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold tracking-wide text-slate-900 uppercase">
            <Building2 className="h-3.5 w-3.5 text-blue-700 print:text-black" />
            {translate("printDocument.customerSectionTitle")}
          </h2>

          <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            <div>
              <span className="text-slate-500">
                {translate("printDocument.customerName")}:{" "}
              </span>
              <strong className="font-semibold text-slate-900">
                {quote.customerName}
              </strong>
            </div>

            <div>
              <span className="text-slate-500">
                {translate("printDocument.customerPhone")}:{" "}
              </span>
              <strong className="font-semibold text-slate-900">
                {quote.customerPhone}
              </strong>
            </div>

            <div>
              <span className="text-slate-500">
                {translate("printDocument.companyName")}:{" "}
              </span>
              <span className="text-slate-800">
                {quote.companyName ?? "Khách hàng cá nhân"}
              </span>
            </div>

            <div>
              <span className="text-slate-500">
                {translate("printDocument.customerEmail")}:{" "}
              </span>
              <span className="text-slate-800">
                {quote.customerEmail ?? "---"}
              </span>
            </div>

            <div>
              <span className="text-slate-500">
                {translate("printDocument.taxId")}:{" "}
              </span>
              <span className="font-mono text-slate-800">
                {quote.taxId ?? "---"}
              </span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-slate-500">
                {translate("printDocument.deliveryAddress")}:{" "}
              </span>
              <span className="text-slate-800">
                {quote.shippingAddress ??
                  "Tại kho bên bán hoặc chân công trình bên mua"}
              </span>
            </div>
          </div>
        </section>

        {/* Section I: Equipment & Pricing Table */}
        <section className="mt-6">
          <h3 className="mb-2 text-xs font-bold tracking-wide text-slate-900 uppercase">
            I. {translate("printDocument.pricingTableTitle")}
          </h3>

          <div className="overflow-hidden rounded-md border border-slate-300">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-100 text-[10px] font-bold tracking-wider text-slate-800 uppercase">
                  <th className="w-8 border-r border-slate-300 px-2 py-2.5 text-center">
                    #
                  </th>
                  <th className="border-r border-slate-300 px-3 py-2.5">
                    {translate("printDocument.colDescription")}
                  </th>
                  <th className="w-14 border-r border-slate-300 px-2 py-2.5 text-center">
                    {translate("printDocument.colUnit")}
                  </th>
                  <th className="w-12 border-r border-slate-300 px-2 py-2.5 text-center">
                    {translate("printDocument.colQty")}
                  </th>
                  <th className="w-28 border-r border-slate-300 px-3 py-2.5 text-right">
                    {translate("printDocument.colUnitPrice")}
                  </th>
                  <th className="w-16 border-r border-slate-300 px-2 py-2.5 text-center">
                    {translate("printDocument.colDiscount")}
                  </th>
                  <th className="w-32 px-3 py-2.5 text-right">
                    {translate("printDocument.colTotal")}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {(quote.items ?? []).map((item, index) => {
                  const unitPrice = parseFloat(item.unitPrice);
                  const discountPercent = parseFloat(item.discountPercent);
                  const finalUnitPrice =
                    unitPrice * (1 - discountPercent / 100);
                  const totalPrice = finalUnitPrice * item.quantity;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="border-r border-slate-200 px-2 py-2.5 text-center font-mono text-slate-500">
                        {index + 1}
                      </td>

                      <td className="border-r border-slate-200 px-3 py-2.5">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">
                            {item.itemName}
                          </span>
                          {item.itemModel && (
                            <span className="mt-0.5 font-mono text-[11px] font-semibold text-blue-800 print:text-black">
                              Model: {item.itemModel}
                            </span>
                          )}
                          {item.itemSpecs && (
                            <span className="mt-0.5 text-[11px] leading-snug text-slate-600">
                              Quy cách: {item.itemSpecs}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="border-r border-slate-200 px-2 py-2.5 text-center text-slate-600">
                        Bộ / Cái
                      </td>

                      <td className="border-r border-slate-200 px-2 py-2.5 text-center font-semibold text-slate-900">
                        {item.quantity}
                      </td>

                      <td className="border-r border-slate-200 px-3 py-2.5 text-right font-mono text-slate-800">
                        {formatCurrency(unitPrice)}
                      </td>

                      <td className="border-r border-slate-200 px-2 py-2.5 text-center font-mono text-slate-700">
                        {discountPercent > 0 ? `${discountPercent}%` : "0%"}
                      </td>

                      <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(totalPrice)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              <tfoot className="border-t-2 border-slate-400 bg-slate-50/70 text-xs font-medium">
                {/* Subtotal */}
                <tr className="border-b border-slate-200">
                  <td
                    colSpan={6}
                    className="px-3 py-2 text-right font-semibold text-slate-700"
                  >
                    {translate("printDocument.subtotal")}:
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(subtotal)}
                  </td>
                </tr>

                {/* VAT */}
                <tr className="border-b border-slate-200">
                  <td
                    colSpan={6}
                    className="px-3 py-2 text-right font-semibold text-slate-700"
                  >
                    {translate("printDocument.vat")} ({vatRate}%):
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(vatAmount)}
                  </td>
                </tr>

                {/* Grand Total */}
                <tr className="bg-slate-100 text-sm font-bold">
                  <td
                    colSpan={6}
                    className="px-3 py-2.5 text-right text-slate-900 uppercase"
                  >
                    {translate("printDocument.grandTotal")}:
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-base text-blue-900 print:text-black">
                    {formatCurrency(grandTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Amount In Words */}
          <div className="mt-2.5 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 italic print:bg-transparent">
            <span className="font-semibold text-slate-900 not-italic">
              {translate("printDocument.amountInWords")}:{" "}
            </span>
            <span className="font-bold text-slate-900">{amountInWords}</span>
          </div>
        </section>

        {/* Section II: Commercial & Warranty Terms */}
        <section className="keep-together mt-6 text-xs">
          <h3 className="mb-2 text-xs font-bold tracking-wide text-slate-900 uppercase">
            II. {translate("printDocument.commercialTermsTitle")}
          </h3>

          <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 leading-relaxed text-slate-800">
            <p>
              <strong>1. Thời gian giao hàng:</strong>{" "}
              {terms?.deliveryTime ??
                "Trong vòng 01 - 03 ngày làm việc kể từ ngày nhận tiền tạm ứng."}
            </p>
            <p>
              <strong>2. Địa điểm giao nhận:</strong>{" "}
              {terms?.deliveryLocation ??
                quote.shippingAddress ??
                "Giao hàng và hỗ trợ kỹ thuật tại địa chỉ công trình bên mua."}
            </p>
            <p>
              <strong>3. Phương thức thanh toán:</strong>{" "}
              {terms?.paymentSchedule ??
                "Chuyển khoản theo tiến độ: Tạm ứng 30% khi ký hợp đồng, 70% còn lại sau khi bàn giao và nghiệm thu."}
            </p>
            <p>
              <strong>4. Chính sách bảo hành:</strong>{" "}
              {terms?.warrantyTerms ??
                "Bảo hành chính hãng 12 tháng hoặc 1.000 giờ chạy máy tùy điều kiện nào đến trước theo tiêu chuẩn Hyundai."}
            </p>
            {quote.note && (
              <p>
                <strong>5. Ghi chú & Điều khoản khác:</strong> {quote.note}
              </p>
            )}
          </div>
        </section>

        {/* Signatures & Corporate Seal */}
        <section className="keep-together mt-8 pt-4">
          <div className="grid grid-cols-2 gap-8 text-center text-xs">
            <div className="flex flex-col items-center">
              <span className="font-bold text-slate-900 uppercase">
                ĐẠI DIỆN BÊN MUA
              </span>
              <span className="mt-0.5 text-[11px] text-slate-500 italic">
                (Ký, ghi rõ họ tên và đóng dấu)
              </span>
              <div className="h-24" />
              <span className="font-semibold text-slate-800">
                {quote.customerName}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="font-bold text-slate-900 uppercase">
                ĐẠI DIỆN BÊN BÁN
              </span>
              <span className="mt-0.5 text-[11px] text-slate-500 italic">
                CÔNG TY TNHH THIẾT BỊ CÔNG NGHỆ NHẬT NĂNG
              </span>
              <div className="h-24" />
              <span className="font-bold text-slate-900 uppercase">
                GIÁM ĐỐC / TRƯỞNG BỘ PHẬN KINH DOANH
              </span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* PAGE 2: TECHNICAL SPECIFICATIONS SHEET (PHỤ LỤC THÔNG SỐ KỸ THUẬT)        */}
        {/* ========================================================================= */}
        {generatorItems.length > 0 && (
          <article className="page-break-before pt-10 print:pt-4">
            <div className="mb-6 border-b-2 border-slate-900 pb-3">
              <h2 className="text-base font-extrabold tracking-wide text-slate-900 uppercase">
                PHỤ LỤC: QUY CÁCH & THÔNG SỐ KỸ THUẬT CHI TIẾT MÁY PHÁT ĐIỆN
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                Kèm theo Báo giá số:{" "}
                <strong className="font-mono text-slate-900">
                  {quote.quoteNumber || `#${quote.id.slice(0, 8)}`}
                </strong>{" "}
                | Khách hàng: <strong>{quote.customerName}</strong>
              </p>
            </div>

            <div className="space-y-8">
              {generatorItems.map((item, idx) => {
                const specs = item.product?.specs ?? {};
                const model =
                  typeof specs.model === "string"
                    ? specs.model
                    : (item.itemModel ?? item.product?.slug);
                const rawPower =
                  specs.power ?? specs.standbyPowerKva ?? specs.primePowerKva;
                const power =
                  typeof rawPower === "number" || typeof rawPower === "string"
                    ? String(rawPower)
                    : null;
                const voltage =
                  typeof specs.voltage === "number" ||
                  typeof specs.voltage === "string"
                    ? String(specs.voltage)
                    : "220";
                const frequency =
                  typeof specs.frequency === "number" ||
                  typeof specs.frequency === "string"
                    ? String(specs.frequency)
                    : "50";
                const phase =
                  specs.phase === "3phase"
                    ? "3 Pha 4 Dây, 230/400V"
                    : "1 Pha 2 Dây, 220/230V";
                const powerFactor =
                  typeof specs.powerFactor === "number" ||
                  typeof specs.powerFactor === "string"
                    ? String(specs.powerFactor)
                    : "0.8";
                const engineBrand =
                  typeof specs.engineBrand === "string"
                    ? specs.engineBrand
                    : "Hyundai Engine";
                const engine =
                  typeof specs.engine === "string"
                    ? specs.engine
                    : "Động cơ Diesel 4 thì chính hãng";
                const alternatorBrand =
                  typeof specs.alternatorBrand === "string"
                    ? specs.alternatorBrand
                    : "Hyundai / Stamford";
                const alternator =
                  typeof specs.alternator === "string"
                    ? specs.alternator
                    : "Không chổi than, kích từ tự động AVR";
                const fuelType =
                  specs.fuelType === "gasoline" ? "Xăng" : "Dầu Diesel";
                const fuelConsumption =
                  typeof specs.fuelConsumption === "number" ||
                  typeof specs.fuelConsumption === "string"
                    ? `${String(specs.fuelConsumption)} L/h`
                    : "Tiêu chuẩn tối ưu";
                const fuelTank =
                  typeof specs.fuelTankCapacity === "number" ||
                  typeof specs.fuelTankCapacity === "string"
                    ? `${String(specs.fuelTankCapacity)} Lít`
                    : "Dung tích lớn";
                const noiseLevel =
                  typeof specs.noiseLevel === "number" ||
                  typeof specs.noiseLevel === "string"
                    ? `${String(specs.noiseLevel)} dB(A) @ 7m`
                    : "≤ 70 dB(A) @ 7m";
                const len =
                  typeof specs.length === "number" ||
                  typeof specs.length === "string"
                    ? String(specs.length)
                    : null;
                const wid =
                  typeof specs.width === "number" ||
                  typeof specs.width === "string"
                    ? String(specs.width)
                    : null;
                const hei =
                  typeof specs.height === "number" ||
                  typeof specs.height === "string"
                    ? String(specs.height)
                    : null;
                const dimensions =
                  len && wid && hei
                    ? `${len} x ${wid} x ${hei} mm`
                    : "Kích thước nhỏ gọn đồng bộ";
                const weight =
                  typeof specs.weight === "number" ||
                  typeof specs.weight === "string"
                    ? `${String(specs.weight)} kg`
                    : "---";
                return (
                  <div
                    key={item.id}
                    className="keep-together overflow-hidden rounded-lg border border-slate-300"
                  >
                    {/* Item Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 bg-slate-100 p-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-900 font-mono text-xs text-white">
                          Mục #{idx + 1}
                        </Badge>
                        <h3 className="text-sm font-bold text-slate-900">
                          {item.itemName}
                        </h3>
                      </div>
                      {model && (
                        <span className="rounded border border-slate-200 bg-white px-2 py-0.5 font-mono text-xs font-bold text-blue-800">
                          Model: {model}
                        </span>
                      )}
                    </div>

                    {/* Spec Tables Grid */}
                    <div className="grid grid-cols-1 gap-4 p-4 text-xs md:grid-cols-2">
                      {/* Left: General & Engine Specifications */}
                      <div className="space-y-3">
                        <div>
                          <h4 className="mb-2 flex items-center gap-1.5 border-b border-slate-200 pb-1 text-xs font-bold text-slate-800">
                            <Zap className="h-3.5 w-3.5 text-amber-600 print:text-black" />
                            1. THÔNG SỐ VẬN HÀNH & CÔNG SUẤT
                          </h4>
                          <table className="w-full text-xs">
                            <tbody className="divide-y divide-slate-100">
                              <tr>
                                <td className="w-1/2 py-1 text-slate-500">
                                  Công suất liên tục (Prime):
                                </td>
                                <td className="py-1 font-mono font-semibold text-slate-900">
                                  {power ? `${power} kVA` : "Theo catalogue"}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1 text-slate-500">
                                  Điện áp định mức / Tần số:
                                </td>
                                <td className="py-1 font-mono font-semibold text-slate-900">
                                  {voltage}V / {frequency}Hz
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1 text-slate-500">
                                  Số pha / Hệ số công suất:
                                </td>
                                <td className="py-1 font-semibold text-slate-900">
                                  {phase} (cosφ = {String(powerFactor)})
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1 text-slate-500">
                                  Hệ thống khởi động:
                                </td>
                                <td className="py-1 font-semibold text-slate-900">
                                  Đề điện 12V/24V DC hoặc Tự động ATS
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div>
                          <h4 className="mb-2 flex items-center gap-1.5 border-b border-slate-200 pb-1 text-xs font-bold text-slate-800">
                            <Cpu className="h-3.5 w-3.5 text-blue-600 print:text-black" />
                            2. THÔNG SỐ ĐỘNG CƠ (ENGINE)
                          </h4>
                          <table className="w-full text-xs">
                            <tbody className="divide-y divide-slate-100">
                              <tr>
                                <td className="w-1/2 py-1 text-slate-500">
                                  Hãng sản xuất động cơ:
                                </td>
                                <td className="py-1 font-semibold text-slate-900">
                                  {engineBrand}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1 text-slate-500">
                                  Model động cơ:
                                </td>
                                <td className="py-1 font-mono font-semibold text-slate-900">
                                  {engine}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1 text-slate-500">
                                  Nhiên liệu & Tiêu hao:
                                </td>
                                <td className="py-1 font-semibold text-slate-900">
                                  {fuelType} ({fuelConsumption})
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1 text-slate-500">
                                  Dung tích bình dầu:
                                </td>
                                <td className="py-1 font-mono font-semibold text-slate-900">
                                  {fuelTank}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Right: Alternator, Enclosure & Dimensions */}
                      <div className="space-y-3">
                        <div>
                          <h4 className="mb-2 flex items-center gap-1.5 border-b border-slate-200 pb-1 text-xs font-bold text-slate-800">
                            <ShieldCheck className="h-3.5 w-3.5 text-green-600 print:text-black" />
                            3. ĐẦU PHÁT ĐIỆN & ĐIỀU KHIỂN
                          </h4>
                          <table className="w-full text-xs">
                            <tbody className="divide-y divide-slate-100">
                              <tr>
                                <td className="w-1/2 py-1 text-slate-500">
                                  Hãng sản xuất đầu phát:
                                </td>
                                <td className="py-1 font-semibold text-slate-900">
                                  {alternatorBrand}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1 text-slate-500">
                                  Kiểu đầu phát:
                                </td>
                                <td className="py-1 font-semibold text-slate-900">
                                  {alternator}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1 text-slate-500">
                                  Bảng điều khiển:
                                </td>
                                <td className="py-1 font-semibold text-slate-900">
                                  Màn hình LCD thông minh đa chức năng
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1 text-slate-500">
                                  Tính năng bảo vệ:
                                </td>
                                <td className="py-1 font-semibold text-slate-900">
                                  Tự động ngắt khi quá tải, quá nhiệt, áp suất
                                  dầu thấp
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div>
                          <h4 className="mb-2 flex items-center gap-1.5 border-b border-slate-200 pb-1 text-xs font-bold text-slate-800">
                            <Volume2 className="h-3.5 w-3.5 text-purple-600 print:text-black" />
                            4. VỎ CÁCH ÂM & KÍCH THƯỚC
                          </h4>
                          <table className="w-full text-xs">
                            <tbody className="divide-y divide-slate-100">
                              <tr>
                                <td className="w-1/2 py-1 text-slate-500">
                                  Độ ồn tiêu chuẩn:
                                </td>
                                <td className="py-1 font-mono font-semibold text-slate-900">
                                  {noiseLevel}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1 text-slate-500">
                                  Kích thước (D x R x C):
                                </td>
                                <td className="py-1 font-mono font-semibold text-slate-900">
                                  {dimensions}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1 text-slate-500">
                                  Trọng lượng khô:
                                </td>
                                <td className="py-1 font-mono font-semibold text-slate-900">
                                  {weight}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1 text-slate-500">
                                  Tiêu chuẩn cách âm:
                                </td>
                                <td className="py-1 font-semibold text-slate-900">
                                  Vỏ siêu chống ồn sơn tĩnh điện ngoài trời
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        )}
      </main>
    </div>
  );
};
