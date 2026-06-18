"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { type AddressDTO } from "@nhatnang/database/dtos";
import { Button } from "@nhatnang/ui/components/ui/button";
import { MapPin, Plus, Check } from "lucide-react";
import { AddressDialog } from "./address-dialog";
import {
  deleteAddressAction,
  setDefaultAddressAction,
} from "../actions/address.action";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@nhatnang/ui/components/ui/alert-dialog";

interface AddressListProps {
  initialAddresses: AddressDTO[];
}

export function AddressList({ initialAddresses }: AddressListProps) {
  const ta = useTranslations("Portal.addresses");
  const te = useTranslations("errors");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // State for AddressDialog (Add/Edit)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressDTO | null>(
    null,
  );

  // State for Delete Confirmation Dialog
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);

  const handleEdit = (address: AddressDTO) => {
    setSelectedAddress(address);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedAddress(null);
    setIsDialogOpen(true);
  };

  const handleSetDefault = (id: string) => {
    startTransition(async () => {
      try {
        const result = await setDefaultAddressAction(id);
        if (result.success) {
          toast.success(ta("setDefaultSuccess"));
          router.refresh();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        console.error(error);
        toast.error(te("updateAddressFailed"));
      }
    });
  };

  const handleDeleteConfirm = () => {
    if (!addressToDelete) return;
    const id = addressToDelete;
    setAddressToDelete(null);

    startTransition(async () => {
      try {
        const result = await deleteAddressAction(id);
        if (result.success) {
          toast.success(ta("deleteSuccess"));
          router.refresh();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        console.error(error);
        toast.error(te("deleteAddressFailed"));
      }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <h2 className="text-xl font-bold text-zinc-900">{ta("myAddresses")}</h2>
        <Button onClick={handleAddNew} size="sm" className="gap-2">
          <Plus className="size-4" />
          {ta("addNew")}
        </Button>
      </div>

      {initialAddresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 py-12">
          <MapPin className="mb-3 size-10 text-zinc-300" />
          <p className="text-sm text-zinc-500">{ta("noAddresses")}</p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-200 border-t border-zinc-200">
          {initialAddresses.map((address) => (
            <div
              key={address.id}
              className="flex cursor-pointer items-start justify-between py-6 transition-colors duration-150 hover:bg-zinc-50/50 md:cursor-default md:hover:bg-transparent"
              onClick={() => {
                if (typeof window !== "undefined" && window.innerWidth < 768) {
                  handleEdit(address);
                }
              }}
            >
              {/* Left Column: Details */}
              <div className="flex-1 space-y-1 md:pr-4">
                <div className="flex items-center text-sm font-medium">
                  <span className="text-base font-bold text-zinc-900">
                    {address.receiverName}
                  </span>
                  <span className="mx-2 font-light text-zinc-300">|</span>
                  <span className="font-normal text-zinc-500">
                    {address.phoneNumber}
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-sm text-zinc-600">
                  <p>{address.streetAddress}</p>
                  <p>
                    {address.district}, {address.city}
                  </p>
                </div>
                {address.isDefault && (
                  <span className="bg-primary/10 text-primary mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                    <Check className="size-3" />
                    {ta("defaultTag")}
                  </span>
                )}
              </div>

              {/* Right Column: Actions */}
              <div className="hidden min-w-30 flex-col items-end gap-3 md:flex">
                <div className="hidden items-center gap-3 text-sm md:flex">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(address);
                    }}
                    disabled={isPending}
                    className="cursor-pointer text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
                  >
                    {ta("edit")}
                  </button>
                  {!address.isDefault && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddressToDelete(address.id);
                      }}
                      disabled={isPending}
                      className="hover:text-destructive cursor-pointer text-sm font-medium text-zinc-500 transition-colors"
                    >
                      {ta("delete")}
                    </button>
                  )}
                </div>
                {!address.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetDefault(address.id);
                    }}
                    disabled={isPending}
                    className="h-8 border-zinc-300 px-3 text-xs font-medium text-zinc-700"
                  >
                    {ta("defaultLabel")}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AddressDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        address={selectedAddress}
        onSubmitSuccess={() => router.refresh()}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={addressToDelete !== null}
        onOpenChange={(open) => !open && setAddressToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{ta("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {ta("deleteConfirmDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              {ta("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {ta("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
