"use server";

import { cache } from "react";
import {
  auth,
  getCurrentUserId,
  getOrganizationRole as getCurrentUserRole,
} from "@/lib/auth";

export { auth, getCurrentUserId, getCurrentUserRole };

export const getCurrentUser = cache(async () => {
  const { user, orgRole } = await auth();
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    imageUrl: user.image,
    role: orgRole,
  };
});
