"use client";

import { useEffect, useState } from "react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { translatedZodResolver } from "@/shared/lib/validation-resolver";
import {
  addressSchema,
  type TAddressForm,
} from "@nhatnang/database/validators";
import {
  addAddressAction,
  updateAddressAction,
  deleteAddressAction,
} from "../actions/address.action";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Input } from "@nhatnang/ui/components/ui/input";
import { Checkbox } from "@nhatnang/ui/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@nhatnang/ui/components/ui/dialog";
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
import {
  Field,
  FieldLabel,
  FieldError,
} from "@nhatnang/ui/components/ui/field";
import { type AddressDTO } from "@nhatnang/database/dtos";

interface AddressDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  address?: AddressDTO | null;
  onSubmitSuccess: () => void;
}

export function AddressDialog({
  isOpen,
  onOpenChange,
  address,
  onSubmitSuccess,
}: AddressDialogProps) {
  const t = useTranslations("Portal");
  const ta = useTranslations("Portal.addresses");
  const te = useTranslations("errors");
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const form = useForm<TAddressForm>({
    resolver: translatedZodResolver(addressSchema, t),
    defaultValues: {
      receiverName: "",
      phoneNumber: "",
      streetAddress: "",
      district: "",
      city: "",
      isDefault: false,
    },
  });

  // Reset form when address changes or dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      if (address) {
        form.reset({
          receiverName: address.receiverName,
          phoneNumber: address.phoneNumber,
          streetAddress: address.streetAddress,
          district: address.district,
          city: address.city,
          isDefault: address.isDefault,
        });
      } else {
        form.reset({
          receiverName: "",
          phoneNumber: "",
          streetAddress: "",
          district: "",
          city: "",
          isDefault: false,
        });
      }
    }
  }, [isOpen, address, form]);

  const onSubmit: SubmitHandler<TAddressForm> = async (data) => {
    setIsLoading(true);
    try {
      const result = address
        ? await updateAddressAction(address.id, data)
        : await addAddressAction(data);

      if (!result.success) {
        if ("fieldErrors" in result && result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([key, messages]) => {
            form.setError(key as keyof TAddressForm, {
              type: "server",
              message: messages[0] ?? "",
            });
          });
          return;
        }
        toast.error(
          "error" in result ? result.error : te("updateAddressFailed"),
        );
        return;
      }

      toast.success(address ? ta("updateSuccess") : ta("addSuccess"));
      onSubmitSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error(
        address ? te("updateAddressFailed") : te("createAddressFailed"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!address) return;
    setIsLoading(true);
    try {
      const result = await deleteAddressAction(address.id);
      if (result.success) {
        toast.success(ta("deleteSuccess"));
        onSubmitSuccess();
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error(error);
      toast.error(te("deleteAddressFailed"));
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {address ? ta("editTitle") : ta("addTitle")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
          <Field data-invalid={!!form.formState.errors.receiverName}>
            <FieldLabel htmlFor="receiverName">
              {ta("receiverNameLabel")} *
            </FieldLabel>
            <Input
              id="receiverName"
              disabled={isLoading}
              {...form.register("receiverName")}
              aria-invalid={!!form.formState.errors.receiverName}
            />
            <FieldError>
              {form.formState.errors.receiverName?.message}
            </FieldError>
          </Field>

          <Field data-invalid={!!form.formState.errors.phoneNumber}>
            <FieldLabel htmlFor="phoneNumber">
              {ta("phoneNumberLabel")} *
            </FieldLabel>
            <Input
              id="phoneNumber"
              disabled={isLoading}
              {...form.register("phoneNumber")}
              aria-invalid={!!form.formState.errors.phoneNumber}
            />
            <FieldError>
              {form.formState.errors.phoneNumber?.message}
            </FieldError>
          </Field>

          <Field data-invalid={!!form.formState.errors.streetAddress}>
            <FieldLabel htmlFor="streetAddress">
              {ta("streetAddressLabel")} *
            </FieldLabel>
            <Input
              id="streetAddress"
              disabled={isLoading}
              {...form.register("streetAddress")}
              aria-invalid={!!form.formState.errors.streetAddress}
            />
            <FieldError>
              {form.formState.errors.streetAddress?.message}
            </FieldError>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field data-invalid={!!form.formState.errors.district}>
              <FieldLabel htmlFor="district">
                {ta("districtLabel")} *
              </FieldLabel>
              <Input
                id="district"
                disabled={isLoading}
                {...form.register("district")}
                aria-invalid={!!form.formState.errors.district}
              />
              <FieldError>{form.formState.errors.district?.message}</FieldError>
            </Field>

            <Field data-invalid={!!form.formState.errors.city}>
              <FieldLabel htmlFor="city">{ta("cityLabel")} *</FieldLabel>
              <Input
                id="city"
                disabled={isLoading}
                {...form.register("city")}
                aria-invalid={!!form.formState.errors.city}
              />
              <FieldError>{form.formState.errors.city?.message}</FieldError>
            </Field>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Controller
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <Checkbox
                  id="isDefault"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading || address?.isDefault}
                />
              )}
            />
            <label
              htmlFor="isDefault"
              className="cursor-pointer text-sm leading-none font-medium text-zinc-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {ta("defaultLabel")}
            </label>
          </div>

          <DialogFooter className="flex flex-row items-center justify-between gap-2 pt-4">
            {address && !address.isDefault && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
                className="text-destructive hover:bg-destructive/5 hover:text-destructive mr-auto cursor-pointer"
              >
                {ta("delete")}
              </Button>
            )}
            <div className="ml-auto flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {ta("cancel")}
              </Button>
              <Button type="submit" disabled={isLoading} className="min-w-24">
                {ta("save")}
              </Button>
            </div>
          </DialogFooter>
        </form>
        <AlertDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{ta("deleteConfirmTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {ta("deleteConfirmDesc")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>
                {ta("cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isLoading}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {ta("delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
