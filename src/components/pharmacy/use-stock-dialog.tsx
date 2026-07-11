"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { useStock } from "@/app/dashboard/pharmacy/actions";

const schema = z.object({
  quantity: z.string().regex(/^[1-9]\d*$/, "Quantity must be at least 1"),
});

type Item = { id: string; name: string; unit: string; stock: number };

export function UseStockDialog({ item }: { item: Item }) {
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
    formData.set("medicationId", item.id);
    formData.set("quantity", values.quantity);
    startTransition(async () => {
      try {
        await useStock(formData);
        toast.success(`Used ${values.quantity} ${item.unit}(s) of ${item.name}`);
        form.reset();
        setOpen(false);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to record usage");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm">Use</Button>} />
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Record usage — {item.name}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{item.stock} {item.unit}(s) currently in stock.</p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity used ({item.unit}s)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={item.stock} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending || !form.formState.isValid}>
              {isPending ? "Recording..." : "Record usage"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
