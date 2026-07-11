"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ReportsDateFilter({ from, to }: { from: string; to: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.push(`${pathname}?${next.toString()}`);
    },
    [params, pathname, router],
  );

  const hasFilter = from || to;

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-sm text-muted-foreground">From</label>
        <Input
          type="date"
          value={from}
          onChange={(e) => update("from", e.target.value)}
          className="w-40"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-muted-foreground">To</label>
        <Input
          type="date"
          value={to}
          onChange={(e) => update("to", e.target.value)}
          className="w-40"
        />
      </div>
      {hasFilter && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const next = new URLSearchParams(params.toString());
            next.delete("from");
            next.delete("to");
            router.push(`${pathname}?${next.toString()}`);
          }}
        >
          Clear
        </Button>
      )}
    </div>
  );
}
