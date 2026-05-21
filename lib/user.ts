"use server";

import { cache } from "react";
import {
  auth,
  getCurrentUserId,
  getOrganizationRole as getCurrentOrganizationRole,
} from "@/lib/auth";
import type { Role } from "@/generated/prisma/enums";

export { auth, getCurrentUserId, getCurrentOrganizationRole };

export type CurrentUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  imageUrl: string | null;
  organizationRole: Role;
};

export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
  const { user, orgRole } = await auth();
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    imageUrl: user.image,
    organizationRole: orgRole,
  };
});
