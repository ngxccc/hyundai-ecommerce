"use client";

import { useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Plus, Award, DollarSign, Percent, Loader2, Coins } from "lucide-react";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Input } from "@nhatnang/ui/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@nhatnang/ui/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@nhatnang/ui/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nhatnang/ui/components/ui/card";
import { toast } from "@nhatnang/ui/components/ui/sonner";
import { Badge } from "@nhatnang/ui/components/ui/badge";
import { useRouter } from "next/navigation";
import { createDealerTierAction } from "../actions/customer.actions";
import { type TDealerTier } from "@nhatnang/database/schemas";
import {
  getCreateDealerTierSchema,
  type TCreateDealerTierInput,
} from "@nhatnang/database/validators";

interface TierConfiguratorProps {
  dealerTiers: TDealerTier[];
}

export const TierConfigurator = ({ dealerTiers }: TierConfiguratorProps) => {
  const t = useTranslations("AdminDealerTiers");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Next-Intl translator for strict Zod schema errors
  const formSchema = getCreateDealerTierSchema((key) => {
    return t(key);
  });

  const form = useForm<TCreateDealerTierInput>({
    resolver: zodResolver(formSchema) as Resolver<TCreateDealerTierInput>,
    defaultValues: {
      name: "",
      discountPercentage: "",
      minimumSpend: "0",
    },
  });

  const onSubmit = (data: TCreateDealerTierInput) => {
    startTransition(async () => {
      const payload = {
        name: data.name,
        discountPercentage: data.discountPercentage,
        minimumSpend: data.minimumSpend,
      };

      const finalFormData = new FormData();
      finalFormData.append("payload", JSON.stringify(payload));

      const result = await createDealerTierAction(finalFormData);

      if (result.success) {
        toast.success(t("messages.successCreate"));
        form.reset({
          name: "",
          discountPercentage: "",
          minimumSpend: "0",
        });
        router.refresh();
      } else {
        toast.error(result.error ?? t("messages.errorCreate"));
      }
    });
  };

  // Helper to format minimum spend currency beautifully
  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Left side: Dealer Tiers Table & Responsive Cards list */}
      <Card className="border-muted bg-card col-span-1 gap-0 overflow-hidden py-0 shadow-sm md:col-span-2">
        <CardHeader className="border-b px-6 py-4!">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Award className="text-primary h-5 w-5" />
            {t("title")}
          </CardTitle>
          <CardDescription className="text-slate-500">
            {t("description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-4 md:p-0">
          {/* Tabular view for desktops / larger screens */}
          <div className="hidden overflow-x-auto md:block">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="pl-6 font-semibold text-slate-700">
                    {t("table.name")}
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    {t("table.discount")}
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    {t("table.minSpend")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dealerTiers.length > 0 ? (
                  dealerTiers.map((tier) => (
                    <TableRow
                      key={tier.id}
                      className="transition-colors hover:bg-slate-50/50"
                    >
                      <TableCell className="py-4 pl-6 font-bold text-slate-900">
                        {tier.name}
                      </TableCell>
                      <TableCell className="py-4 font-semibold text-emerald-600">
                        {parseFloat(tier.discountPercentage).toFixed(1)}%
                      </TableCell>
                      <TableCell className="py-4 text-slate-600">
                        {formatCurrency(tier.minimumSpend)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-muted-foreground h-32 text-center"
                    >
                      {t("empty")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Bento list view for mobile and tablet screens */}
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:hidden">
            {dealerTiers.length > 0 ? (
              dealerTiers.map((tier) => (
                <div
                  key={tier.id}
                  className="flex flex-col justify-between space-y-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-shadow hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-base leading-tight font-bold text-slate-900">
                      {tier.name}
                    </span>
                    <Badge
                      variant="outline"
                      className="shrink-0 border border-emerald-500/20 bg-emerald-500/10 font-bold text-emerald-600"
                    >
                      -{parseFloat(tier.discountPercentage).toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Coins className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>{t("card.spendThreshold")}</span>
                    <span className="font-bold text-slate-700">
                      {formatCurrency(tier.minimumSpend)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="border-muted text-muted-foreground col-span-full flex h-32 items-center justify-center rounded-lg border bg-white text-sm shadow-sm">
                {t("empty")}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Right side: Add New Tier Form Card */}
      <Card className="border-muted bg-card/60 col-span-1 h-fit gap-0 py-0 shadow-sm backdrop-blur-md">
        <CardHeader className="grid-rows-none border-b px-6 py-4!">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Plus className="text-primary h-5 w-5" />
            {t("form.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-slate-700">
                      {t("form.name")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("form.namePlaceholder")}
                        disabled={isPending}
                        {...field}
                        className="border-slate-200 bg-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discountPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-slate-700">
                      {t("form.discount")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder={t("form.discountPlaceholder")}
                          disabled={isPending}
                          {...field}
                          className="border-slate-200 bg-white pr-9"
                        />
                        <Percent className="absolute top-3 right-3 h-4 w-4 text-slate-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minimumSpend"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-slate-700">
                      {t("form.minSpend")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          step="1000"
                          placeholder={t("form.minSpendPlaceholder")}
                          disabled={isPending}
                          {...field}
                          className="border-slate-200 bg-white pr-9"
                        />
                        <DollarSign className="absolute top-3 right-3 h-4 w-4 text-slate-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isPending}
                className="bg-primary hover:bg-primary/95 mt-2 flex w-full items-center justify-center gap-1.5 font-bold text-white shadow-sm"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t("form.submitting")}</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>{t("form.submit")}</span>
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
