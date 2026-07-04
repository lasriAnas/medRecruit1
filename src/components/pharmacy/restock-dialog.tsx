"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { restockMedication } from "@/app/dashboard/pharmacy/actions";

const schema = z.object({
  quantity: z.string().regex(/^[1-9]\d*$/, "Quantity must be at least 1"),
});

type Medication = { id: string; name: string; unit: string };

export function RestockDialog({ medication }: { medication: Medication }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { quantity: "1" },
  });

  function onSubmit(values: { quantity: string }) {
    const formData = new FormData();
    formData.set("medicationId", medication.id);
    formData.set("quantity", values.quantity);
    startTransition(async () => {
      await restockMedication(formData);
      form.reset();
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm">Restock</Button>} />
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Restock {medication.name}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity ({medication.unit}s to add)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending || !form.formState.isValid}>
              {isPending ? "Restocking..." : "Add stock"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
