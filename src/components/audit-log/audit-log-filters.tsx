"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ACTION_OPTIONS = [
  { value: "ACCOUNT_CREATED", label: "Account created" },
  { value: "ROLE_CHANGED", label: "Role changed" },
  { value: "ACCOUNT_DEACTIVATED", label: "Account deactivated" },
  { value: "ACCOUNT_REACTIVATED", label: "Account reactivated" },
  { value: "PATIENT_DELETED", label: "Patient deleted" },
  { value: "INVOICE_CREATED", label: "Invoice created" },
  { value: "INVOICE_PAID", label: "Payment confirmed" },
  { value: "INVOICE_STATUS_CHANGED", label: "Invoice status changed" },
  { value: "MEDICATION_RESTOCKED", label: "Medication restocked" },
  { value: "MEDICATION_USED", label: "Medication used" },
];

export function AuditLogFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const action = params.get("action") ?? "";
  const actor = params.get("actor") ?? "";

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      router.push(`${pathname}?${next.toString()}`);
    },
    [params, pathname, router],
  );

  const hasFilters = action || actor;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        placeholder="Search actor..."
        value={actor}
        onChange={(e) => update("actor", e.target.value)}
        className="w-48"
      />
      <Select
        items={Object.fromEntries(ACTION_OPTIONS.map((o) => [o.value, o.label]))}
        value={action || undefined}
        onValueChange={(v) => update("action", v ?? "")}
      >
        <SelectTrigger className="w-52">
          <SelectValue placeholder="All actions" />
        </SelectTrigger>
        <SelectContent>
          {ACTION_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(pathname)}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
