"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { translatedZodResolver } from "@/shared/lib/validation-resolver";
import { useIsClient } from "@/shared/hooks/useIsClient";
import {
  createEmployeeSchema,
  type TCreateEmployeeForm,
} from "@nhatnang/database/validators";
import { createEmployeeAction } from "../actions/employee.action";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Input } from "@nhatnang/ui/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldError,
} from "@nhatnang/ui/components/ui/field";
import { type UserProfileDTO } from "@nhatnang/database/dtos";
import { Plus, X, User, Mail, Phone } from "lucide-react";

interface EmployeesViewProps {
  initialEmployees: UserProfileDTO[];
}

export function EmployeesView({ initialEmployees }: EmployeesViewProps) {
  const t = useTranslations("Portal");
  const te = useTranslations("Portal.employees");
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isClient = useIsClient();

  const form = useForm<TCreateEmployeeForm>({
    resolver: translatedZodResolver(createEmployeeSchema, t),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit: SubmitHandler<TCreateEmployeeForm> = async (data) => {
    setIsLoading(true);
    try {
      const result = await createEmployeeAction(data);
      if (result.success) {
        toast.success(te("successAdd"));
        form.reset();
        setIsAdding(false);
        router.refresh();
      } else {
        if ("fieldErrors" in result && result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([key, messages]) => {
            form.setError(key as keyof TCreateEmployeeForm, {
              type: "manual",
              message: messages[0] ?? "",
            });
          });
        } else if ("error" in result) {
          toast.error(result.error);
        } else {
          toast.error(te("errorAdd"));
        }
      }
    } catch {
      toast.error(te("errorAdd"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{te("description")}</p>
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            size="sm"
            className="flex items-center gap-1"
          >
            <Plus className="size-4" />
            {te("addButton")}
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="space-y-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
            <h3 className="font-semibold text-zinc-900">{te("addButton")}</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-500 hover:text-zinc-700"
              onClick={() => {
                setIsAdding(false);
                form.reset();
              }}
            >
              <X className="size-4" />
            </Button>
          </div>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <Field>
              <FieldLabel>{te("nameLabel")}</FieldLabel>
              <Input
                {...form.register("name")}
                disabled={isLoading}
                placeholder="Nguyen Van A"
              />
              <FieldError>{form.formState.errors.name?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel>{te("emailLabel")}</FieldLabel>
              <Input
                type="email"
                {...form.register("email")}
                disabled={isLoading}
                placeholder="employee@company.com"
              />
              <FieldError>{form.formState.errors.email?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel>{te("phoneLabel")}</FieldLabel>
              <Input
                {...form.register("phone")}
                disabled={isLoading}
                placeholder="0987654321"
              />
              <FieldError>{form.formState.errors.phone?.message}</FieldError>
            </Field>

            <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2">
              <Field>
                <FieldLabel>{te("passwordLabel")}</FieldLabel>
                <Input
                  type="password"
                  {...form.register("password")}
                  disabled={isLoading}
                />
                <FieldError>
                  {form.formState.errors.password?.message}
                </FieldError>
              </Field>

              <Field>
                <FieldLabel>{te("confirmPasswordLabel")}</FieldLabel>
                <Input
                  type="password"
                  {...form.register("confirmPassword")}
                  disabled={isLoading}
                />
                <FieldError>
                  {form.formState.errors.confirmPassword?.message}
                </FieldError>
              </Field>
            </div>

            <div className="flex justify-end gap-2 pt-2 md:col-span-2">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => {
                  setIsAdding(false);
                  form.reset();
                }}
              >
                {te("cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? te("submitting") : te("submit")}
              </Button>
            </div>
          </form>
        </div>
      )}

      {isClient && initialEmployees.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 p-8 text-center">
          <User className="mb-2 size-8 text-zinc-400" />
          <p className="text-sm font-medium text-zinc-900">
            {te("noEmployees")}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <table className="min-w-full divide-y divide-zinc-200 text-left text-sm text-zinc-500">
            <thead className="bg-zinc-50 text-xs font-semibold text-zinc-700 uppercase">
              <tr>
                <th className="px-6 py-3">{te("nameLabel")}</th>
                <th className="px-6 py-3">{te("emailLabel")}</th>
                <th className="px-6 py-3">{te("phoneLabel")}</th>
                <th className="px-6 py-3">{te("role")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {isClient &&
                initialEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-zinc-50">
                    <td className="flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap text-zinc-900">
                      <User className="size-4 text-zinc-400" />
                      {emp.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-2">
                        <Mail className="size-4 text-zinc-400" />
                        {emp.email}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="flex items-center gap-2">
                        <Phone className="size-4 text-zinc-400" />
                        {emp.phone}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset">
                        {emp.role}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
