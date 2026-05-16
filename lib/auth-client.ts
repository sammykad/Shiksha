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
  plugins: [
    organizationClient({
      roles: organizationRoles,
    }),
    emailOTPClient(),
  ],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  useListOrganizations,
  useActiveOrganization,
  organization,
  emailOtp: emailOTP,
} = authClient;
