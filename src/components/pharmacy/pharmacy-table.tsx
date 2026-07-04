"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { deleteMedication } from "@/app/dashboard/pharmacy/actions";
import { RestockDialog } from "@/components/pharmacy/restock-dialog";

type Medication = {
  id: string;
  name: string;
  unit: string;
  stock: number;
  reorderThreshold: number;
};

export function PharmacyTable({
  data,
  canRestock,
  canDelete,
}: {
  data: Medication[];
  canRestock: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = data.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()),
  );

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteMedication(id);
      setConfirmingDelete(null);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Search medications..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Reorder threshold</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  {data.length === 0 ? "No medications added yet." : "No medications match your search."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((med) => (
                <TableRow key={med.id}>
                  <TableCell className="font-medium">{med.name}</TableCell>
                  <TableCell>{med.unit}</TableCell>
                  <TableCell>
                    <span className={med.stock <= med.reorderThreshold ? "text-destructive font-semibold" : ""}>
                      {med.stock}
                    </span>
                    {med.stock <= med.reorderThreshold && (
                      <Badge variant="destructive" className="ml-2 text-xs">Low stock</Badge>
                    )}
                  </TableCell>
                  <TableCell>{med.reorderThreshold}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      {canRestock && <RestockDialog medication={med} />}
                      {canDelete && (
                        confirmingDelete === med.id ? (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setConfirmingDelete(null)}
                              disabled={isPending}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(med.id)}
                              disabled={isPending}
                            >
                              {isPending ? "Deleting..." : "Confirm"}
                            </Button>
                          </>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setConfirmingDelete(med.id)}
                          >
                            Delete
                          </Button>
                        )
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
