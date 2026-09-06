"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { FileText, Plus, Trash2, Layers, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateProductInput } from "@/shared/validators";
import type {
  SpecGroup,
  SpecItem,
  ProductSpecSheet,
} from "@/types/product-spec";
import { SPEC_TEMPLATE_OPTIONS } from "../../constants/spec-templates";

interface SpecSheetEditorProps {
  form: UseFormReturn<CreateProductInput>;
}

export const SpecSheetEditor = ({ form }: SpecSheetEditorProps) => {
  const t = useTranslations("AdminProductForm");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  const specSheet: ProductSpecSheet =
    (form.watch("specSheet") as ProductSpecSheet | undefined) ?? [];

  const updateSpecSheet = (nextSheet: ProductSpecSheet) => {
    form.setValue("specSheet", nextSheet, { shouldDirty: true });
  };

  const handleApplyTemplate = (templateId: string) => {
    const opt = SPEC_TEMPLATE_OPTIONS.find((o) => o.id === templateId);
    if (!opt) return;

    const cloned = JSON.parse(JSON.stringify(opt.template)) as ProductSpecSheet;
    updateSpecSheet(cloned);
    setSelectedTemplate(templateId);
  };

  const handleAddGroup = () => {
    const newGroup: SpecGroup = {
      groupKey: `group_${Date.now()}`,
      titleVi: "Nhóm thông số",
      order: specSheet.length + 1,
      items: [
        {
          key: `item_${Date.now()}`,
          nameVi: "",
          value: "",
          unit: "",
        },
      ],
    };
    updateSpecSheet([...specSheet, newGroup]);
  };

  const handleRemoveGroup = (groupIndex: number) => {
    const updated = specSheet.filter((_, idx) => idx !== groupIndex);
    updateSpecSheet(updated);
  };

  const handleUpdateGroupTitle = (groupIndex: number, newTitle: string) => {
    const updated = specSheet.map((group, idx) =>
      idx === groupIndex ? { ...group, titleVi: newTitle } : group,
    );
    updateSpecSheet(updated);
  };

  const handleAddItem = (groupIndex: number) => {
    const newItem: SpecItem = {
      key: `item_${Date.now()}`,
      nameVi: "",
      value: "",
      unit: "",
    };
    const updated = specSheet.map((group, idx) =>
      idx === groupIndex
        ? { ...group, items: [...group.items, newItem] }
        : group,
    );
    updateSpecSheet(updated);
  };

  const handleRemoveItem = (groupIndex: number, itemIndex: number) => {
    const updated = specSheet.map((group, gIdx) =>
      gIdx === groupIndex
        ? {
            ...group,
            items: group.items.filter((_, iIdx) => iIdx !== itemIndex),
          }
        : group,
    );
    updateSpecSheet(updated);
  };

  const handleUpdateItem = (
    groupIndex: number,
    itemIndex: number,
    field: "nameVi" | "value" | "unit",
    val: string,
  ) => {
    const updated = specSheet.map((group, gIdx) => {
      if (gIdx !== groupIndex) return group;
      return {
        ...group,
        items: group.items.map((item, iIdx) => {
          if (iIdx !== itemIndex) return item;
          const nextKey =
            field === "nameVi" && !item.key
              ? val
                  .toLowerCase()
                  .replace(/[^a-z0-9]/g, "_")
                  .slice(0, 30)
              : item.key;
          return { ...item, [field]: val, key: nextKey };
        }),
      };
    });
    updateSpecSheet(updated);
  };

  return (
    <Card size="dense" collapsible defaultOpen={true}>
      <CardHeader bordered size="dense">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle size="lg">
            <FileText />
            {t("fields.specSheetTitle")}
          </CardTitle>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={selectedTemplate}
              onValueChange={handleApplyTemplate}
            >
              <SelectTrigger className="h-9 w-65 text-xs">
                <Sparkles className="text-muted-foreground mr-1.5 size-3.5" />
                <SelectValue placeholder={t("fields.selectTemplate")} />
              </SelectTrigger>
              <SelectContent>
                {SPEC_TEMPLATE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id} className="text-xs">
                    {t(`templateOptions.${opt.id}` as never)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddGroup}
              className="h-9 gap-1 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              {t("fields.addGroup")}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent size="dense" className="space-y-6">
        {specSheet.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
            <Layers className="text-muted-foreground/60 mb-2 h-10 w-10" />
            <p className="text-muted-foreground text-sm font-medium">
              {t("fields.emptySpecSheetTitle")}
            </p>
            <p className="text-muted-foreground/80 mt-1 max-w-sm text-xs">
              {t("fields.emptySpecSheetDescription")}
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddGroup}
              className="mt-4 gap-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              {t("fields.createFirstGroup")}
            </Button>
          </div>
        ) : (
          specSheet.map((group, groupIdx) => (
            <div
              key={group.groupKey || groupIdx}
              className="bg-card rounded-lg border p-4 shadow-2xs"
            >
              <div className="mb-3 flex items-center justify-between gap-3 border-b pb-2.5">
                <div className="flex flex-1 items-center gap-2">
                  <span className="bg-primary/10 text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                    {groupIdx + 1}
                  </span>
                  <Input
                    value={group.titleVi}
                    onChange={(e) =>
                      handleUpdateGroupTitle(groupIdx, e.target.value)
                    }
                    className="h-8 max-w-xs text-sm font-semibold"
                    placeholder={t("fields.groupTitlePlaceholder")}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveGroup(groupIdx)}
                  className="text-destructive hover:bg-destructive/10 h-8 gap-1 px-2 text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("fields.deleteGroup")}
                </Button>
              </div>

              <div className="space-y-2">
                <div className="text-muted-foreground hidden grid-cols-12 gap-2 px-1 text-xs font-semibold sm:grid">
                  <div className="col-span-5">{t("fields.colParamName")}</div>
                  <div className="col-span-4">{t("fields.colParamValue")}</div>
                  <div className="col-span-2">{t("fields.colParamUnit")}</div>
                  <div className="col-span-1 text-center">
                    {t("fields.colParamDelete")}
                  </div>
                </div>

                {group.items.map((item, itemIdx) => (
                  <div
                    key={item.key || itemIdx}
                    className="grid grid-cols-1 gap-2 rounded-md bg-slate-50/50 p-1.5 sm:grid-cols-12 sm:bg-transparent"
                  >
                    <div className="col-span-5">
                      <Input
                        value={item.nameVi}
                        onChange={(e) =>
                          handleUpdateItem(
                            groupIdx,
                            itemIdx,
                            "nameVi",
                            e.target.value,
                          )
                        }
                        placeholder={t("fields.paramNamePlaceholder")}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="col-span-4">
                      <Input
                        value={item.value}
                        onChange={(e) =>
                          handleUpdateItem(
                            groupIdx,
                            itemIdx,
                            "value",
                            e.target.value,
                          )
                        }
                        placeholder={t("fields.paramValuePlaceholder")}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        value={item.unit ?? ""}
                        onChange={(e) =>
                          handleUpdateItem(
                            groupIdx,
                            itemIdx,
                            "unit",
                            e.target.value,
                          )
                        }
                        placeholder={t("fields.paramUnitPlaceholder")}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(groupIdx, itemIdx)}
                        className="text-muted-foreground hover:text-destructive h-8 w-8"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddItem(groupIdx)}
                  className="text-primary hover:bg-primary/10 mt-1 h-8 gap-1.5 px-2 text-xs font-medium"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t("fields.addItem")}
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
