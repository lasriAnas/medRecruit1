"use client";

import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUserRole } from "@/app/dashboard/users/actions";
import type { Role } from "@/generated/prisma/enums";

const ROLES: Role[] = ["ADMIN", "DOCTOR", "RECEPTIONIST"];

export function RoleSelect({
  profileId,
  role,
  disabled,
}: {
  profileId: string;
  role: Role;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      items={{ ADMIN: "Admin", DOCTOR: "Doctor", RECEPTIONIST: "Receptionist" }}
      value={role}
      disabled={disabled || isPending}
      onValueChange={(value) =>
        startTransition(() => updateUserRole(profileId, value as Role))
      }
    >
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((r) => (
          <SelectItem key={r} value={r}>
            {r === "ADMIN" ? "Admin" : r === "DOCTOR" ? "Doctor" : "Receptionist"}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
