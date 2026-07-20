import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-48" />

      {/* Alert strip */}
      <div className="flex gap-3">
        <Skeleton className="h-20 flex-1 rounded-lg" />
        <Skeleton className="h-20 flex-1 rounded-lg" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader><Skeleton className="h-4 w-28" /></CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-4 w-24 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
          <CardContent className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="flex-1 h-2 rounded-full" />
                <Skeleton className="h-4 w-6" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
          <CardContent className="flex flex-col divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="py-3 flex items-center gap-2">
                <Skeleton className="flex-1 h-4" />
                <Skeleton className="h-4 w-10" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
