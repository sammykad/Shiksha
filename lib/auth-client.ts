import { createAuthClient } from "better-auth/react";
import { emailOTPClient, organizationClient } from "better-auth/client/plugins";
import { Role } from "@/generated/prisma/enums";
import {
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access";

const organizationRoles = {
  [Role.ADMIN]: ownerAc,
  [Role.TEACHER]: memberAc,
  [Role.STUDENT]: memberAc,
  [Role.PARENT]: memberAc,
};

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
  plugins: [
    organizationClient({
      roles: organizationRoles,
    }),
    emailOTPClient(),
  ],
});

export const {
  useSession,
  useListOrganizations,
  useActiveOrganization,
  useActiveMemberRole,
  organization,
  emailOtp,
  signIn,
  signUp,
} = authClient;
