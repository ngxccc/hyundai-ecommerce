"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { translatedZodResolver } from "@/shared/lib/validation-resolver";
import { type TAddShippingBidInput, addShippingBidSchema } from "@nhatnang/database/validators";
import type { ComplexOrder } from "@nhatnang/database/services";
import { selectShippingBidAction, addShippingBidAction } from "../actions";
import { toast } from "@nhatnang/ui/components/ui/sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@nhatnang/ui/components/ui/card";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Input } from "@nhatnang/ui/components/ui/input";
import { Textarea } from "@nhatnang/ui/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@nhatnang/ui/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@nhatnang/ui/components/ui/table";
import { Badge } from "@nhatnang/ui/components/ui/badge";
import { Truck, Plus, CheckCircle2 } from "lucide-react";
import { formatNumberInput } from "@nhatnang/shared/lib/utils";

interface ShippingBidPanelProps {
  order: ComplexOrder;
}

export const ShippingBidPanel = ({ order }: ShippingBidPanelProps) => {
  const t = useTranslations("AdminOrders");
  const [isPending, startTransition] = useTransition();

  const form = useForm<TAddShippingBidInput>({
    resolver: translatedZodResolver(addShippingBidSchema, t),
    defaultValues: {
      orderId: order.id,
      vendorName: "",
      quotedPrice: "",
      internalNote: "",
    },
  });

  const onSubmit = (data: TAddShippingBidInput) => {
    startTransition(async () => {
      const result = await addShippingBidAction(data);
      if (result.success) {
        toast.success(t("shippingBidsAddBidSuccess"));
        form.reset({
          orderId: order.id,
          vendorName: "",
          quotedPrice: "",
          internalNote: "",
        });
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleSelectWinner = (bidId: string) => {
    startTransition(async () => {
      const result = await selectShippingBidAction(order.id, bidId);
      if (result.success) {
        toast.success(t("shippingBidsSelectWinnerSuccess"));
      } else {
        toast.error(result.error);
      }
    });
  };

  const formatCurrency = (amountStr: string) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(amountStr));
  };

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="text-muted-foreground h-5 w-5" />
          {t("shippingBidsTitle")}
        </CardTitle>
        <CardDescription>{t("shippingBidsDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {order.bids && order.bids.length > 0 ? (
          <div className="mb-2 rounded-md border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>{t("shippingBidsVendor")}</TableHead>
                  <TableHead>{t("shippingBidsPrice")}</TableHead>
                  <TableHead>{t("shippingBidsNote")}</TableHead>
                  <TableHead className="text-center">
                    {t("shippingBidsStatus")}
                  </TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.bids.map((bid) => (
                  <TableRow key={bid.id}>
                    <TableCell className="font-medium">
                      {bid.vendorName}
                    </TableCell>
                    <TableCell>{formatCurrency(bid.quotedPrice)}</TableCell>
                    <TableCell className="text-muted-foreground max-w-50 truncate">
                      {bid.internalNote ?? "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {bid.isSelected ? (
                        <Badge variant="default" className="bg-green-600">
                          {t("shippingBidsWinning")}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          {t("shippingBidsPending")}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!bid.isSelected && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleSelectWinner(bid.id)}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          {t("shippingBidsSelectWinner")}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-muted-foreground flex h-32 flex-col items-center justify-center rounded-md border border-dashed">
            <Truck className="mb-2 h-8 w-8 opacity-20" />
            <p>{t("shippingBidsNoBids")}</p>
          </div>
        )}

        {/* Add Bid Form */}
        <div className="bg-muted/30 rounded-md p-4 pb-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="vendorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("shippingBidsVendor")}</FormLabel>
                      <FormControl>
                        <Input placeholder="Grab, Ahamove..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quotedPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("shippingBidsPrice")}</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="150.000"
                          {...field}
                          onChange={(e) => {
                            field.onChange(formatNumberInput(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="internalNote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("shippingBidsNote")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("shippingBidsNotePlaceholder")}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("shippingBidsAddBid")}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
};
