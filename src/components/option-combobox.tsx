"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

export type ComboboxOption = { id: string; name: string };

export function OptionCombobox({
  options,
  value,
  onChange,
  placeholder,
  emptyText = "No matches found.",
  className = "w-full",
}: {
  options: ComboboxOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
  emptyText?: string;
  className?: string;
}) {
  const selected = options.find((o) => o.id === value) ?? null;

  return (
    <Combobox
      items={options}
      value={selected}
      onValueChange={(item: ComboboxOption | null) => onChange(item ? item.id : "")}
      itemToStringLabel={(item: ComboboxOption) => item.name}
      isItemEqualToValue={(item: ComboboxOption, val: ComboboxOption) => item.id === val?.id}
    >
      <ComboboxInput placeholder={placeholder} className={className} />
      <ComboboxContent>
        <ComboboxEmpty>{emptyText}</ComboboxEmpty>
        <ComboboxList>
          {(item: ComboboxOption) => (
            <ComboboxItem key={item.id} value={item}>
              {item.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
