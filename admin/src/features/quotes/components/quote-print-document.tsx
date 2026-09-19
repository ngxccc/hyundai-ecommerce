"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  FileCheck2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AdminQuote, AdminCompanySettings } from "@/types/api";
import { QuotePdfDocument } from "./quote-pdf-document";
import type { PdfLocale } from "./quote-pdf";

// Dynamically import PDFViewer with SSR disabled to prevent canvas/font SSR issues
const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => null,
  },
);

export interface QuotePrintDocumentProps {
  quote: AdminQuote;
  company: AdminCompanySettings;
}

export const QuotePrintDocument = ({
  quote,
  company,
}: QuotePrintDocumentProps) => {
  const t = useTranslations("adminQuotes");
  const activeLocale = useLocale();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [includeAppendix, setIncludeAppendix] = useState(true);
  const [pdfLocale, setPdfLocale] = useState<PdfLocale>(
    activeLocale.startsWith("en") ? "en" : "vi",
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const [isOpeningTab, setIsOpeningTab] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const quoteNo = quote.quoteNumber ?? quote.id.slice(0, 8);
  const hasGeneratorItems = quote.items.length > 0;

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const blob = await pdf(
        <QuotePdfDocument
          quote={quote}
          company={company}
          includeAppendix={includeAppendix}
          locale={pdfLocale}
        />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Quotation_${quoteNo}_${pdfLocale.toUpperCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(t("printDocument.downloadPdfSuccess"));
    } catch (error) {
      console.error("[QuotePrintDocument] Failed to download PDF:", error);
      toast.error(t("printDocument.downloadPdfError"));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenPdfTab = async () => {
    setIsOpeningTab(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const blob = await pdf(
        <QuotePdfDocument
          quote={quote}
          company={company}
          includeAppendix={includeAppendix}
          locale={pdfLocale}
        />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 300000);
    } catch (error) {
      console.error("[QuotePrintDocument] Failed to open PDF tab:", error);
      toast.error(t("printDocument.openPdfTabError"));
    } finally {
      setIsOpeningTab(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900">
      {/* Action Header Toolbar */}
      <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-3 shadow-xs">
        {/* Left: Back Navigation & Quote Identity */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/quotes/${quote.id}`)}
            className="gap-2 text-xs font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("printDocument.backToQuote")}
          </Button>

          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="text-xs font-bold text-blue-900"
            >
              {quoteNo}
            </Badge>
            <span className="hidden text-xs text-slate-500 sm:inline">|</span>
            <span className="hidden text-xs font-medium text-slate-700 sm:inline">
              {quote.customerName}
              {quote.companyName ? ` (${quote.companyName})` : ""}
            </span>
          </div>
        </div>

        {/* Center: Controls (Language Toggle & Appendix Toggle) */}
        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => setPdfLocale("vi")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                pdfLocale === "vi"
                  ? "bg-blue-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>🇻🇳 Tiếng Việt</span>
            </button>
            <button
              type="button"
              onClick={() => setPdfLocale("en")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                pdfLocale === "en"
                  ? "bg-blue-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>🇬🇧 English</span>
            </button>
          </div>

          {/* Appendix Toggle */}
          {hasGeneratorItems && (
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={includeAppendix}
                  onChange={(e) => setIncludeAppendix(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                />
                <FileCheck2 className="h-3.5 w-3.5 text-blue-800" />
                <span>{t("printDocument.toggleAppendix")}</span>
              </label>
            </div>
          )}
        </div>

        {/* Right: PDF Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenPdfTab}
            disabled={isOpeningTab}
            className="gap-1.5 text-xs font-medium"
            title={t("printDocument.openPdfTabTooltip")}
          >
            {isOpeningTab ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ExternalLink className="h-3.5 w-3.5" />
            )}
            <span>{t("printDocument.openPdfTab")}</span>
          </Button>

          <Button
            size="sm"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="gap-1.5 bg-blue-900 text-xs font-semibold text-white shadow-xs hover:bg-blue-800"
          >
            {isDownloading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            <span>{t("printDocument.downloadPdf")}</span>
          </Button>
        </div>
      </header>

      {/* Embedded Vector PDF Canvas Viewer */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col p-4 sm:p-6">
        <div className="relative h-[calc(100vh-100px)] w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {mounted ? (
            <PDFViewer
              key={`${pdfLocale}-${includeAppendix}`}
              width="100%"
              height="100%"
              showToolbar={true}
              className="h-full w-full border-0"
            >
              <QuotePdfDocument
                quote={quote}
                company={company}
                includeAppendix={includeAppendix}
                locale={pdfLocale}
              />
            </PDFViewer>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-white">
              <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
              <p className="text-sm font-medium text-slate-600">
                {t("printDocument.loadingPdf")}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
