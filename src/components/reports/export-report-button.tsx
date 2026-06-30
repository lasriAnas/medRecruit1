"use client";

import { Button } from "@/components/ui/button";
import { toCsv, downloadCsv } from "@/lib/csv";

export type ReportExportData = {
  summary: { Metric: string; Value: string | number }[];
  doctorWorkload: { Doctor: string; "Appointments this week": number }[];
};

export function ExportReportButton({ data }: { data: ReportExportData }) {
  function handleExport() {
    const summaryCsv = toCsv(data.summary, ["Metric", "Value"]);
    const workloadCsv = toCsv(data.doctorWorkload, ["Doctor", "Appointments this week"]);
    downloadCsv("reports-summary.csv", `${summaryCsv}\n\n${workloadCsv}`);
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleExport}>
      Export CSV
    </Button>
  );
}
