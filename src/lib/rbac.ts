import { Role } from "@prisma/client";

const order: Role[] = ["VIEWER", "MEMBER", "MANAGER", "ADMIN", "OWNER"];

export function roleAtLeast(role: Role, min: Role) {
  return order.indexOf(role) >= order.indexOf(min);
}

export function canWrite(role: Role) {
  return roleAtLeast(role, "MEMBER");
}

export function canAdmin(role: Role) {
  return roleAtLeast(role, "ADMIN");
}
