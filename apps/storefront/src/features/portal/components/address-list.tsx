"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { type AddressDTO } from "@nhatnang/database/dtos";
import { Button } from "@nhatnang/ui/components/ui/button";
import { MapPin, Plus, Edit2, Trash2, Check } from "lucide-react";
import { AddressDialog } from "./address-dialog";
import { deleteAddressAction, setDefaultAddressAction } from "../actions/address.action";
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
  const [selectedAddress, setSelectedAddress] = useState<AddressDTO | null>(null);

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
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
          <MapPin className="size-5 text-zinc-500" />
          {ta("title")}
        </h2>
        <Button onClick={handleAddNew} size="sm" className="gap-2">
          <Plus className="size-4" />
          {ta("addNew")}
        </Button>
      </div>

      {initialAddresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50">
          <MapPin className="size-10 text-zinc-300 mb-3" />
          <p className="text-sm text-zinc-500">{ta("noAddresses")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {initialAddresses.map((address) => (
            <div
              key={address.id}
              className={`relative flex flex-col justify-between p-5 rounded-xl border bg-white shadow-xs transition-all ${
                address.isDefault
                  ? "border-primary ring-1 ring-primary/10"
                  : "border-zinc-200 hover:border-zinc-300"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-zinc-900">
                    {address.receiverName}
                  </span>
                  {address.isDefault && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      <Check className="size-3" />
                      {ta("defaultTag")}
                    </span>
                  )}
                </div>
                <div className="mt-2 space-y-1 text-sm text-zinc-600">
                  <p>{address.phoneNumber}</p>
                  <p className="mt-1 font-light text-zinc-700">
                    {address.streetAddress}
                  </p>
                  <p className="font-light text-zinc-700">
                    {address.district}, {address.city}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-2 border-t border-zinc-100 pt-4">
                <div>
                  {!address.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(address.id)}
                      disabled={isPending}
                      className="h-8 px-2 text-xs text-zinc-500 hover:text-zinc-900"
                    >
                      {ta("defaultLabel")}
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(address)}
                    disabled={isPending}
                    className="size-8 text-zinc-500 hover:text-zinc-900"
                  >
                    <Edit2 className="size-3.5" />
                    <span className="sr-only">{ta("edit")}</span>
                  </Button>
                  {!address.isDefault && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setAddressToDelete(address.id)}
                      disabled={isPending}
                      className="size-8 text-zinc-500 hover:text-destructive hover:bg-destructive/5"
                    >
                      <Trash2 className="size-3.5" />
                      <span className="sr-only">{ta("delete")}</span>
                    </Button>
                  )}
                </div>
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
            <AlertDialogCancel disabled={isPending}>{ta("cancel")}</AlertDialogCancel>
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
