"use client";

import { useQuoteStore } from "../hooks/use-quote";
import { Button } from "@/components/ui/button";
import { FileText, Send } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

interface AddToQuoteButtonProps {
  productId: string;
  name: string;
  price: string;
  image: string;
  totalStock: number;
}

export function AddToQuoteButton({
  productId,
  name,
  price,
  image,
  totalStock,
}: AddToQuoteButtonProps) {
  const t = useTranslations("Quote");
  const router = useRouter();
  const { addItem } = useQuoteStore();

  const handleAddToList = () => {
    addItem({ productId, name, price, image, totalStock }, 1);
    toast.success(t("addedSuccess", { name }));
  };

  const handleQuoteNow = () => {
    addItem({ productId, name, price, image, totalStock }, 1);
    router.push("/quote");
  };

  return (
    <div className="flex w-full flex-col gap-2.5 sm:flex-row lg:flex-col">
      <Button
        size="lg"
        className="w-full gap-2 font-bold tracking-wider uppercase shadow-sm"
        onClick={handleQuoteNow}
      >
        <Send className="size-4" />
        {t("quoteNow")}
      </Button>

      <Button
        variant="outline"
        size="lg"
        className="w-full gap-2 border-zinc-200 font-bold tracking-wider text-zinc-700 uppercase hover:bg-zinc-100"
        onClick={handleAddToList}
      >
        <FileText className="size-4" />
        {t("addToList")}
      </Button>
    </div>
  );
}
