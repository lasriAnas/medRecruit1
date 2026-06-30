"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getPatientDetail, deletePatient } from "@/app/dashboard/patients/actions";
import { getViewerRole } from "@/lib/auth-actions";

type Detail = Awaited<ReturnType<typeof getPatientDetail>>;

export function PatientDetailDialog({
  patientId,
  children,
  className,
}: {
  patientId: string;
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [canDelete, setCanDelete] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    setConfirmingDelete(false);
    if (nextOpen) {
      setDetail(null);
      startTransition(async () => {
        const [data, role] = await Promise.all([getPatientDetail(patientId), getViewerRole()]);
        setDetail(data);
        setCanDelete(role === "ADMIN");
      });
    }
  }

  function handleDelete() {
    startTransition(async () => {
      await deletePatient(patientId);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <button type="button" onClick={() => handleOpenChange(true)} className={className}>
        {children}
      </button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{detail?.name ?? "Patient details"}</DialogTitle>
        </DialogHeader>

        {isPending && !detail ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : !detail ? (
          <p className="text-sm text-muted-foreground">Patient not found.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {detail.unpaidInvoices.length > 0 && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <span className="font-medium">
                  {detail.unpaidInvoices.length} unpaid invoice
                  {detail.unpaidInvoices.length > 1 ? "s" : ""}
                </span>{" "}
                totaling{" "}
                {detail.unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0)} MAD
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Date of birth</div>
                <div>{detail.dob}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Gender</div>
                <div>{detail.gender === "MALE" ? "Male" : "Female"}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Phone</div>
                <div>{detail.phone}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Address</div>
                <div>{detail.address ?? "—"}</div>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium">Appointment history</div>
              {detail.appointments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No appointments yet.</p>
              ) : (
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                  {detail.appointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="flex items-center justify-between border-b pb-2 last:border-none"
                    >
                      <div>
                        <div className="font-medium">Dr. {appt.doctorName}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(appt.scheduledAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {appt.invoiceStatus && (
                          <Badge variant={appt.invoiceStatus === "UNPAID" ? "destructive" : "secondary"}>
                            {appt.invoiceStatus === "UNPAID"
                              ? `UNPAID · ${appt.invoiceAmount} MAD`
                              : appt.invoiceStatus}
                          </Badge>
                        )}
                        <Badge variant="secondary">{appt.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {canDelete && (
              <>
                <Separator />

                <div className="flex items-center justify-end gap-2">
                  {confirmingDelete ? (
                    <>
                      <span className="text-sm text-muted-foreground mr-auto">
                        Delete this patient and all their appointments?
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirmingDelete(false)}
                        disabled={isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={isPending}
                      >
                        {isPending ? "Deleting..." : "Confirm delete"}
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => setConfirmingDelete(true)}
                    >
                      Delete patient
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
