"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "cn";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  filter?: (value: string, search: string, keywords?: string[]) => number;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  disabled = false,
  className,
  triggerClassName,
  filter,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedOption = React.useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value],
  );

  return (
    <div className={cn("relative w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "border-input focus-visible:border-ring focus-visible:ring-ring/50 data-[placeholder]:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 flex h-9 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
              !selectedOption && "text-muted-foreground",
              triggerClassName,
            )}
            aria-expanded={open}
          >
            <span className="truncate text-left text-sm">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronsUpDown className="text-muted-foreground ml-2 size-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={4}
          className="w-[var(--radix-popover-trigger-width)] max-w-sm min-w-[200px] p-0 shadow-md"
        >
          <Command filter={filter}>
            <CommandInput
              placeholder={searchPlaceholder}
              className="h-9 text-xs"
            />
            <CommandList className="max-h-56">
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => {
                  const isSelected = value === opt.value;
                  return (
                    <CommandItem
                      key={opt.value}
                      value={opt.value}
                      onSelect={(currentValue) => {
                        onChange(currentValue);
                        setOpen(false);
                      }}
                      className="cursor-pointer text-xs"
                    >
                      <span className="truncate">{opt.label}</span>
                      <Check
                        className={cn(
                          "ml-auto size-4",
                          isSelected ? "text-primary opacity-100" : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
