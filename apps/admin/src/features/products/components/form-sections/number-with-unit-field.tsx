"use client";

import { useState, useMemo } from "react";
import { Input } from "@nhatnang/ui/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nhatnang/ui/components/ui/select";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@nhatnang/ui/components/ui/form";
import type { ControllerRenderProps, FieldValues, Path } from "react-hook-form";

interface UnitOption {
  value: string;
  label: string;
  multiplier: number; // Multiplier to convert to base unit. e.g. Tấn -> KG (multiplier: 1000)
}

interface NumberWithUnitFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>,
> {
  label: string;
  placeholder?: string;
  field: ControllerRenderProps<TFieldValues, TName>;
  units: UnitOption[];
  defaultUnit?: string;
}

export const NumberWithUnitField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>,
>({
  label,
  placeholder,
  field,
  units,
  defaultUnit,
}: NumberWithUnitFieldProps<TFieldValues, TName>) => {
  // Find initial unit based on value, default to first unit or defaultUnit
  const baseUnit = defaultUnit ?? units[0]?.value ?? "";
  const [selectedUnit, setSelectedUnit] = useState(baseUnit);

  const currentMultiplier =
    units.find((u) => u.value === selectedUnit)?.multiplier ?? 1;

  const displayValue = useMemo(() => {
    if (
      field.value === undefined ||
      field.value === null ||
      field.value === ""
    ) {
      return "";
    }

    const numValue = Number(field.value);
    if (isNaN(numValue)) {
      return "";
    }

    const converted = numValue / currentMultiplier;
    return Number(converted.toFixed(6)).toString();
  }, [field.value, currentMultiplier]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    if (val === "") {
      field.onChange(null); // Use null instead of undefined to properly clear in React Hook Form
      return;
    }

    const num = Number(val);
    if (!isNaN(num)) {
      field.onChange(num * currentMultiplier);
    }
  };

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <div className="flex gap-2">
        <FormControl>
          <Input
            type="number"
            step="any"
            placeholder={placeholder}
            value={displayValue}
            onChange={handleInputChange}
            onBlur={field.onBlur}
            onWheel={(e) => (e.target as HTMLInputElement).blur()}
            name={field.name}
            className="flex-1"
          />
        </FormControl>
        {units.length > 1 ? (
          <Select value={selectedUnit} onValueChange={setSelectedUnit}>
            <FormControl>
              <SelectTrigger className="w-27.5">
                <SelectValue />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {units.map((u) => (
                <SelectItem key={u.value} value={u.value}>
                  {u.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="border-input bg-muted text-muted-foreground flex items-center rounded-md border px-3 text-sm">
            {units[0]?.label}
          </div>
        )}
      </div>
      <FormMessage />
    </FormItem>
  );
};
