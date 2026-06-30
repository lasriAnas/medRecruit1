"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema, type InvoiceFormValues } from "@/lib/schemas/invoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OptionCombobox } from "@/components/option-combobox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type Option = { id: string; name: string };

export function InvoiceForm({
  action,
  appointments,
  onSuccess,
}: {
  action: (formData: FormData) => Promise<unknown>;
  appointments: Option[];
  onSuccess?: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    mode: "onChange",
    defaultValues: { appointmentId: "", amount: "" },
  });

  function onSubmit(values: InvoiceFormValues) {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value) formData.set(key, value);
    });
    startTransition(async () => {
      await action(formData);
      form.reset();
      onSuccess?.();
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-md">
        <FormField
          control={form.control}
          name="appointmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Appointment</FormLabel>
              <FormControl>
                <OptionCombobox
                  options={appointments}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Search for an appointment..."
                  emptyText="No un-invoiced appointments found."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (MAD)</FormLabel>
              <FormControl>
                <Input
                  inputMode="numeric"
                  placeholder="300"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending || !form.formState.isValid}>
          {isPending ? "Creating..." : "Create invoice"}
        </Button>
      </form>
    </Form>
  );
}
