import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/with-retry";
import { MessagesLayout } from "@/components/messages/messages-layout";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const params = await searchParams;
  const withId = params.with ?? null;

  let otherName = "";
  if (withId) {
    const other = await withRetry(() =>
      prisma.profile.findUnique({
        where: { id: withId },
        select: { name: true },
      }),
    );
    otherName = other?.name ?? "";
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Messages</h1>
      <MessagesLayout
        currentProfileId={profile.id}
        initialActiveId={withId}
        initialActiveName={otherName}
      />
    </div>
  );
}
