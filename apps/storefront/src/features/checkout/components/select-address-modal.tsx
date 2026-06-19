"use client";

import { useTranslations } from "next-intl";
import { type AddressDTO } from "@nhatnang/database/dtos";
import { Button } from "@nhatnang/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@nhatnang/ui/components/ui/dialog";
import { MapPin, Check, Plus } from "lucide-react";
import { Link } from "@/i18n/routing";

interface SelectAddressModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  addresses: AddressDTO[];
  onSelect: (address: AddressDTO) => void;
}

export function SelectAddressModal({
  isOpen,
  onOpenChange,
  addresses,
  onSelect,
}: SelectAddressModalProps) {
  const t = useTranslations("Checkout");
  const ta = useTranslations("Portal.addresses");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {t("selectAddressTitle") ?? "Select Shipping Address"}
          </DialogTitle>
        </DialogHeader>

        {addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-3 py-8 text-center">
            <MapPin className="size-10 text-zinc-300" />
            <div>
              <p className="text-sm font-semibold text-zinc-900">
                {t("noSavedAddresses") ?? "No saved addresses"}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {t("noSavedAddressesDesc") ??
                  "Please add a shipping address in your address book first."}
              </p>
            </div>
            <Button asChild size="sm" className="mt-2">
              <Link href="/portal/addresses" className="gap-2">
                <Plus className="size-4" />
                {ta("addNew")}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="max-h-[60dvh] space-y-3 overflow-y-auto py-2 pr-1">
            {addresses.map((address) => (
              <div
                key={address.id}
                onClick={() => {
                  onSelect(address);
                  onOpenChange(false);
                }}
                className="hover:border-primary/50 flex cursor-pointer flex-col space-y-1.5 rounded-xl border border-zinc-200 bg-white p-4 text-left transition-all hover:bg-zinc-50/50"
              >
                <div className="flex items-center justify-between text-sm font-medium">
                  <div className="flex items-center">
                    <span className="font-bold text-zinc-900">
                      {address.receiverName}
                    </span>
                    <span className="mx-2 font-light text-zinc-300">|</span>
                    <span className="font-normal text-zinc-500">
                      {address.phoneNumber}
                    </span>
                  </div>
                  {address.isDefault && (
                    <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold">
                      <Check className="size-2.5" />
                      {ta("defaultTag")}
                    </span>
                  )}
                </div>
                <div className="space-y-0.5 text-xs text-zinc-500">
                  <p>{address.streetAddress}</p>
                  <p>
                    {address.district}, {address.city}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
