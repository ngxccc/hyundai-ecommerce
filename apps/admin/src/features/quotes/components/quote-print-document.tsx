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
import { Button } from "@nhatnang/ui/components/ui/button";
import { Badge } from "@nhatnang/ui/components/ui/badge";
import { numberToVietnameseWords } from "@nhatnang/shared";
import type { ComplexQuote } from "@nhatnang/database/services";
import type { TProductSpecs } from "@nhatnang/database/validators";

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
  const generatorItems = quote.items.filter((item) => {
    const specs = item.product?.specs as TProductSpecs | undefined;
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
            {quote.quoteNumber ?? `#${quote.id.slice(0, 8)}`}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => window.print()}
            className="gap-2 shadow-xs text-xs font-semibold"
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
          <div className="flex flex-col gap-1 max-w-md">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-wider text-blue-900 uppercase">
                HYUNDAI POWER PRODUCTS
              </span>
            </div>
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wide mt-1">
              CÔNG TY TNHH THIẾT BỊ CÔNG NGHỆ NHẬT NĂNG
            </p>
            <p className="text-[11px] leading-relaxed text-slate-600">
              Địa chỉ: 310/61 Đường Chiến Lược, P. Bình Trị Đông A, Q. Bình Tân, TP. HCM
              <br />
              Hotline: <span className="font-semibold text-slate-900">0901.49.7771</span> | Email: hyundaipowerproducts.vn@gmail.com
              <br />
              Mã số thuế: <span className="font-semibold text-slate-900">0316447814</span> | Website: https://hyundaipowerproducts.vn
            </p>
          </div>

          <div className="flex flex-col sm:items-end text-left sm:text-right print:items-end print:text-right">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">
              {translate("printDocument.quoteTitle")}
            </h1>
            <div className="mt-2 flex flex-col gap-1 text-xs font-medium text-slate-700">
              <span>
                {translate("printDocument.quoteNo")}:{" "}
                <strong className="font-mono text-slate-900 font-bold">
                  {quote.quoteNumber ?? `#${quote.id.slice(0, 8)}`}
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
        <section className="mt-6 rounded-lg bg-slate-50 p-4 border border-slate-200 text-xs print:bg-slate-50/50 print:border-slate-300">
          <h2 className="font-bold text-slate-900 uppercase tracking-wide text-xs mb-2.5 flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-blue-700 print:text-black" />
            {translate("printDocument.customerSectionTitle")}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            <div>
              <span className="text-slate-500">{translate("printDocument.customerName")}: </span>
              <strong className="text-slate-900 font-semibold">{quote.customerName}</strong>
            </div>

            <div>
              <span className="text-slate-500">{translate("printDocument.customerPhone")}: </span>
              <strong className="text-slate-900 font-semibold">{quote.customerPhone}</strong>
            </div>

            <div>
              <span className="text-slate-500">{translate("printDocument.companyName")}: </span>
              <span className="text-slate-800">{quote.companyName ?? "Khách hàng cá nhân"}</span>
            </div>

            <div>
              <span className="text-slate-500">{translate("printDocument.customerEmail")}: </span>
              <span className="text-slate-800">{quote.customerEmail ?? "---"}</span>
            </div>

            <div>
              <span className="text-slate-500">{translate("printDocument.taxId")}: </span>
              <span className="text-slate-800 font-mono">{quote.taxId ?? "---"}</span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-slate-500">{translate("printDocument.deliveryAddress")}: </span>
              <span className="text-slate-800">{quote.shippingAddress ?? "Tại kho bên bán hoặc chân công trình bên mua"}</span>
            </div>
          </div>
        </section>

        {/* Section I: Equipment & Pricing Table */}
        <section className="mt-6">
          <h3 className="font-bold text-slate-900 uppercase tracking-wide text-xs mb-2">
            I. {translate("printDocument.pricingTableTitle")}
          </h3>

          <div className="overflow-hidden border border-slate-300 rounded-md">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-2 text-center w-8 border-r border-slate-300">#</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">
                    {translate("printDocument.colDescription")}
                  </th>
                  <th className="py-2.5 px-2 text-center w-14 border-r border-slate-300">
                    {translate("printDocument.colUnit")}
                  </th>
                  <th className="py-2.5 px-2 text-center w-12 border-r border-slate-300">
                    {translate("printDocument.colQty")}
                  </th>
                  <th className="py-2.5 px-3 text-right w-28 border-r border-slate-300">
                    {translate("printDocument.colUnitPrice")}
                  </th>
                  <th className="py-2.5 px-2 text-center w-16 border-r border-slate-300">
                    {translate("printDocument.colDiscount")}
                  </th>
                  <th className="py-2.5 px-3 text-right w-32">
                    {translate("printDocument.colTotal")}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {quote.items.map((item, index) => {
                  const unitPrice = parseFloat(item.unitPrice ?? "0");
                  const discountPercent = parseFloat(item.discountPercent ?? "0");
                  const finalUnitPrice = unitPrice * (1 - discountPercent / 100);
                  const totalPrice = finalUnitPrice * item.quantity;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-2 text-center font-mono text-slate-500 border-r border-slate-200">
                        {index + 1}
                      </td>

                      <td className="py-2.5 px-3 border-r border-slate-200">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">
                            {item.itemName}
                          </span>
                          {item.itemModel && (
                            <span className="font-mono text-[11px] text-blue-800 font-semibold mt-0.5 print:text-black">
                              Model: {item.itemModel}
                            </span>
                          )}
                          {item.itemSpecs && (
                            <span className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                              Quy cách: {item.itemSpecs}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-2.5 px-2 text-center text-slate-600 border-r border-slate-200">
                        Bộ / Cái
                      </td>

                      <td className="py-2.5 px-2 text-center font-semibold text-slate-900 border-r border-slate-200">
                        {item.quantity}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono text-slate-800 border-r border-slate-200">
                        {formatCurrency(unitPrice)}
                      </td>

                      <td className="py-2.5 px-2 text-center font-mono text-slate-700 border-r border-slate-200">
                        {discountPercent > 0 ? `${discountPercent}%` : "0%"}
                      </td>

                      <td className="py-2.5 px-3 text-right font-bold font-mono text-slate-900">
                        {formatCurrency(totalPrice)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              <tfoot className="border-t-2 border-slate-400 bg-slate-50/70 font-medium text-xs">
                {/* Subtotal */}
                <tr className="border-b border-slate-200">
                  <td colSpan={6} className="py-2 px-3 text-right font-semibold text-slate-700">
                    {translate("printDocument.subtotal")}:
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(subtotal)}
                  </td>
                </tr>

                {/* VAT */}
                <tr className="border-b border-slate-200">
                  <td colSpan={6} className="py-2 px-3 text-right font-semibold text-slate-700">
                    {translate("printDocument.vat")} ({vatRate}%):
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(vatAmount)}
                  </td>
                </tr>

                {/* Grand Total */}
                <tr className="bg-slate-100 font-bold text-sm">
                  <td colSpan={6} className="py-2.5 px-3 text-right text-slate-900 uppercase">
                    {translate("printDocument.grandTotal")}:
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-base text-blue-900 print:text-black">
                    {formatCurrency(grandTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Amount In Words */}
          <div className="mt-2.5 px-3 py-2 rounded bg-slate-50 border border-slate-200 text-xs italic text-slate-800 print:bg-transparent">
            <span className="font-semibold not-italic text-slate-900">
              {translate("printDocument.amountInWords")}:{" "}
            </span>
            <span className="font-bold text-slate-900">{amountInWords}</span>
          </div>
        </section>

        {/* Section II: Commercial & Warranty Terms */}
        <section className="mt-6 keep-together text-xs">
          <h3 className="font-bold text-slate-900 uppercase tracking-wide text-xs mb-2">
            II. {translate("printDocument.commercialTermsTitle")}
          </h3>

          <div className="rounded-lg border border-slate-200 p-4 space-y-2 bg-white text-slate-800 leading-relaxed">
            <p>
              <strong>1. Thời gian giao hàng:</strong>{" "}
              {terms?.deliveryTime ?? "Trong vòng 01 - 03 ngày làm việc kể từ ngày nhận tiền tạm ứng."}
            </p>
            <p>
              <strong>2. Địa điểm giao nhận:</strong>{" "}
              {terms?.deliveryLocation ?? quote.shippingAddress ?? "Giao hàng và hỗ trợ kỹ thuật tại địa chỉ công trình bên mua."}
            </p>
            <p>
              <strong>3. Phương thức thanh toán:</strong>{" "}
              {terms?.paymentSchedule ?? "Chuyển khoản theo tiến độ: Tạm ứng 30% khi ký hợp đồng, 70% còn lại sau khi bàn giao và nghiệm thu."}
            </p>
            <p>
              <strong>4. Chính sách bảo hành:</strong>{" "}
              {terms?.warrantyTerms ?? "Bảo hành chính hãng 12 tháng hoặc 1.000 giờ chạy máy tùy điều kiện nào đến trước theo tiêu chuẩn Hyundai."}
            </p>
            {quote.note && (
              <p>
                <strong>5. Ghi chú & Điều khoản khác:</strong> {quote.note}
              </p>
            )}
          </div>
        </section>

        {/* Signatures & Corporate Seal */}
        <section className="mt-8 keep-together pt-4">
          <div className="grid grid-cols-2 gap-8 text-center text-xs">
            <div className="flex flex-col items-center">
              <span className="font-bold uppercase text-slate-900">ĐẠI DIỆN BÊN MUA</span>
              <span className="text-[11px] text-slate-500 italic mt-0.5">(Ký, ghi rõ họ tên và đóng dấu)</span>
              <div className="h-24" />
              <span className="font-semibold text-slate-800">{quote.customerName}</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="font-bold uppercase text-slate-900">ĐẠI DIỆN BÊN BÁN</span>
              <span className="text-[11px] text-slate-500 italic mt-0.5">CÔNG TY TNHH THIẾT BỊ CÔNG NGHỆ NHẬT NĂNG</span>
              <div className="h-24" />
              <span className="font-bold text-slate-900 uppercase">GIÁM ĐỐC / TRƯỞNG BỘ PHẬN KINH DOANH</span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* PAGE 2: TECHNICAL SPECIFICATIONS SHEET (PHỤ LỤC THÔNG SỐ KỸ THUẬT)        */}
        {/* ========================================================================= */}
        {generatorItems.length > 0 && (
          <article className="page-break-before pt-10 print:pt-4">
            <div className="border-b-2 border-slate-900 pb-3 mb-6">
              <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
                PHỤ LỤC: QUY CÁCH & THÔNG SỐ KỸ THUẬT CHI TIẾT MÁY PHÁT ĐIỆN
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Kèm theo Báo giá số: <strong className="font-mono text-slate-900">{quote.quoteNumber ?? `#${quote.id.slice(0, 8)}`}</strong> | Khách hàng: <strong>{quote.customerName}</strong>
              </p>
            </div>

            <div className="space-y-8">
              {generatorItems.map((item, idx) => {
                const specs = (item.product?.specs ?? {}) as Record<string, unknown>;
                const model = typeof specs["model"] === "string" ? specs["model"] : item.itemModel ?? item.product?.slug;
                const rawPower = specs["power"] ?? specs["standbyPowerKva"] ?? specs["primePowerKva"];
                const power = typeof rawPower === "number" || typeof rawPower === "string" ? String(rawPower) : null;
                const voltage = typeof specs["voltage"] === "number" || typeof specs["voltage"] === "string" ? String(specs["voltage"]) : "220";
                const frequency = typeof specs["frequency"] === "number" || typeof specs["frequency"] === "string" ? String(specs["frequency"]) : "50";
                const phase = specs["phase"] === "3phase" ? "3 Pha 4 Dây, 230/400V" : "1 Pha 2 Dây, 220/230V";
                const powerFactor = typeof specs["powerFactor"] === "number" || typeof specs["powerFactor"] === "string" ? String(specs["powerFactor"]) : "0.8";
                const engineBrand = typeof specs["engineBrand"] === "string" ? specs["engineBrand"] : "Hyundai Engine";
                const engine = typeof specs["engine"] === "string" ? specs["engine"] : "Động cơ Diesel 4 thì chính hãng";
                const alternatorBrand = typeof specs["alternatorBrand"] === "string" ? specs["alternatorBrand"] : "Hyundai / Stamford";
                const alternator = typeof specs["alternator"] === "string" ? specs["alternator"] : "Không chổi than, kích từ tự động AVR";
                const fuelType = specs["fuelType"] === "gasoline" ? "Xăng" : "Dầu Diesel";
                const fuelConsumption =
                  typeof specs["fuelConsumption"] === "number" || typeof specs["fuelConsumption"] === "string"
                    ? `${String(specs["fuelConsumption"])} L/h`
                    : "Tiêu chuẩn tối ưu";
                const fuelTank =
                  typeof specs["fuelTankCapacity"] === "number" || typeof specs["fuelTankCapacity"] === "string"
                    ? `${String(specs["fuelTankCapacity"])} Lít`
                    : "Dung tích lớn";
                const noiseLevel =
                  typeof specs["noiseLevel"] === "number" || typeof specs["noiseLevel"] === "string"
                    ? `${String(specs["noiseLevel"])} dB(A) @ 7m`
                    : "≤ 70 dB(A) @ 7m";
                const len =
                  typeof specs["length"] === "number" || typeof specs["length"] === "string"
                    ? String(specs["length"])
                    : null;
                const wid =
                  typeof specs["width"] === "number" || typeof specs["width"] === "string"
                    ? String(specs["width"])
                    : null;
                const hei =
                  typeof specs["height"] === "number" || typeof specs["height"] === "string"
                    ? String(specs["height"])
                    : null;
                const dimensions = len && wid && hei ? `${len} x ${wid} x ${hei} mm` : "Kích thước nhỏ gọn đồng bộ";
                const weight =
                  typeof specs["weight"] === "number" || typeof specs["weight"] === "string"
                    ? `${String(specs["weight"])} kg`
                    : "---";
                return (
                  <div key={item.id} className="keep-together border border-slate-300 rounded-lg overflow-hidden">
                    {/* Item Header */}
                    <div className="bg-slate-100 p-3 border-b border-slate-300 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-900 text-white font-mono text-xs">
                          Mục #{idx + 1}
                        </Badge>
                        <h3 className="font-bold text-sm text-slate-900">
                          {item.itemName}
                        </h3>
                      </div>
                      {model && (
                        <span className="font-mono text-xs font-bold text-blue-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                          Model: {model}
                        </span>
                      )}
                    </div>

                    {/* Spec Tables Grid */}
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Left: General & Engine Specifications */}
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-2 flex items-center gap-1.5 text-xs">
                            <Zap className="h-3.5 w-3.5 text-amber-600 print:text-black" />
                            1. THÔNG SỐ VẬN HÀNH & CÔNG SUẤT
                          </h4>
                          <table className="w-full text-xs">
                            <tbody className="divide-y divide-slate-100">
                              <tr>
                                <td className="py-1 text-slate-500 w-1/2">Công suất liên tục (Prime):</td>
                                <td className="py-1 font-semibold text-slate-900 font-mono">{power ? `${power} kVA` : "Theo catalogue"}</td>
                              </tr>
                              <tr>
                                <td className="py-1 text-slate-500">Điện áp định mức / Tần số:</td>
                                <td className="py-1 font-semibold text-slate-900 font-mono">{voltage}V / {frequency}Hz</td>
                              </tr>
                              <tr>
                                <td className="py-1 text-slate-500">Số pha / Hệ số công suất:</td>
                                <td className="py-1 font-semibold text-slate-900">{phase} (cosφ = {String(powerFactor)})</td>
                              </tr>
                              <tr>
                                <td className="py-1 text-slate-500">Hệ thống khởi động:</td>
                                <td className="py-1 font-semibold text-slate-900">Đề điện 12V/24V DC hoặc Tự động ATS</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-2 flex items-center gap-1.5 text-xs">
                            <Cpu className="h-3.5 w-3.5 text-blue-600 print:text-black" />
                            2. THÔNG SỐ ĐỘNG CƠ (ENGINE)
                          </h4>
                          <table className="w-full text-xs">
                            <tbody className="divide-y divide-slate-100">
                              <tr>
                                <td className="py-1 text-slate-500 w-1/2">Hãng sản xuất động cơ:</td>
                                <td className="py-1 font-semibold text-slate-900">{engineBrand}</td>
                              </tr>
                              <tr>
                                <td className="py-1 text-slate-500">Model động cơ:</td>
                                <td className="py-1 font-semibold text-slate-900 font-mono">{engine}</td>
                              </tr>
                              <tr>
                                <td className="py-1 text-slate-500">Nhiên liệu & Tiêu hao:</td>
                                <td className="py-1 font-semibold text-slate-900">{fuelType} ({fuelConsumption})</td>
                              </tr>
                              <tr>
                                <td className="py-1 text-slate-500">Dung tích bình dầu:</td>
                                <td className="py-1 font-semibold text-slate-900 font-mono">{fuelTank}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Right: Alternator, Enclosure & Dimensions */}
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-2 flex items-center gap-1.5 text-xs">
                            <ShieldCheck className="h-3.5 w-3.5 text-green-600 print:text-black" />
                            3. ĐẦU PHÁT ĐIỆN & ĐIỀU KHIỂN
                          </h4>
                          <table className="w-full text-xs">
                            <tbody className="divide-y divide-slate-100">
                              <tr>
                                <td className="py-1 text-slate-500 w-1/2">Hãng sản xuất đầu phát:</td>
                                <td className="py-1 font-semibold text-slate-900">{alternatorBrand}</td>
                              </tr>
                              <tr>
                                <td className="py-1 text-slate-500">Kiểu đầu phát:</td>
                                <td className="py-1 font-semibold text-slate-900">{alternator}</td>
                              </tr>
                              <tr>
                                <td className="py-1 text-slate-500">Bảng điều khiển:</td>
                                <td className="py-1 font-semibold text-slate-900">Màn hình LCD thông minh đa chức năng</td>
                              </tr>
                              <tr>
                                <td className="py-1 text-slate-500">Tính năng bảo vệ:</td>
                                <td className="py-1 font-semibold text-slate-900">Tự động ngắt khi quá tải, quá nhiệt, áp suất dầu thấp</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-2 flex items-center gap-1.5 text-xs">
                            <Volume2 className="h-3.5 w-3.5 text-purple-600 print:text-black" />
                            4. VỎ CÁCH ÂM & KÍCH THƯỚC
                          </h4>
                          <table className="w-full text-xs">
                            <tbody className="divide-y divide-slate-100">
                              <tr>
                                <td className="py-1 text-slate-500 w-1/2">Độ ồn tiêu chuẩn:</td>
                                <td className="py-1 font-semibold text-slate-900 font-mono">{noiseLevel}</td>
                              </tr>
                              <tr>
                                <td className="py-1 text-slate-500">Kích thước (D x R x C):</td>
                                <td className="py-1 font-semibold text-slate-900 font-mono">{dimensions}</td>
                              </tr>
                              <tr>
                                <td className="py-1 text-slate-500">Trọng lượng khô:</td>
                                <td className="py-1 font-semibold text-slate-900 font-mono">{weight}</td>
                              </tr>
                              <tr>
                                <td className="py-1 text-slate-500">Tiêu chuẩn cách âm:</td>
                                <td className="py-1 font-semibold text-slate-900">Vỏ siêu chống ồn sơn tĩnh điện ngoài trời</td>
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
