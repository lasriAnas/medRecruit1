"use client";

import { useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoleSelect } from "@/components/users/role-select";
import { setUserActive } from "@/app/dashboard/users/actions";
import type { Role } from "@/generated/prisma/enums";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  mustChangePassword: boolean;
  createdAt: string;
};

function DeactivateButton({ id, active }: { id: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant={active ? "destructive" : "outline"}
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => setUserActive(id, !active))}
    >
      {isPending ? "..." : active ? "Deactivate" : "Reactivate"}
    </Button>
  );
}

export function UsersTable({ data, currentUserId }: { data: UserRow[]; currentUserId: string }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((user) => {
            const isSelf = user.id === currentUserId;
            return (
              <TableRow key={user.id}>
                <TableCell>
                  {user.name}
                  {isSelf && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <RoleSelect profileId={user.id} role={user.role} disabled={isSelf} />
                </TableCell>
                <TableCell className="flex flex-wrap gap-1">
                  <Badge variant={user.active ? "secondary" : "destructive"}>
                    {user.active ? "Active" : "Deactivated"}
                  </Badge>
                  {user.mustChangePassword && (
                    <Badge variant="outline">Password reset pending</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {!isSelf && <DeactivateButton id={user.id} active={user.active} />}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
