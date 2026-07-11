"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AuditLogPaginator({
  page,
  pageCount,
  total,
}: {
  page: number;
  pageCount: number;
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function goTo(p: number) {
    const next = new URLSearchParams(params.toString());
    if (p === 0) next.delete("page");
    else next.set("page", String(p));
    router.push(`${pathname}?${next.toString()}`);
  }

  if (pageCount <= 1) return null;

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>
        {total} events · page {page + 1} of {pageCount}
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => goTo(page - 1)} disabled={page === 0}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => goTo(page + 1)} disabled={page >= pageCount - 1}>
          Next
        </Button>
      </div>
    </div>
  );
}
