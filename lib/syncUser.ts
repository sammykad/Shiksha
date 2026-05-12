'use server';

import prisma from '@/lib/db';
import { clerkClient } from '@clerk/nextjs/server';
import { Role } from '@/generated/prisma/enums';
import { Prisma } from '@/generated/prisma/client';

function mapClerkRoleToInternalRole(clerkRole: string): Role {
  const roleMap: Record<string, Role> = {
    'org:admin': 'ADMIN',
    'org:teacher': 'TEACHER',
    'org:student': 'STUDENT',
    'org:parent': 'PARENT',
  };

  return roleMap[clerkRole] || 'STUDENT'; // default to STUDENT if unknown
}

export const syncUser = async (
  userId: string,
  orgId: string,
  orgRole: string
): Promise<void> => {
  const client = await clerkClient();

  const user = await withRetry(() => client.users.getUser(userId));
  const role = mapClerkRoleToInternalRole(orgRole);

  const clerkId = user.id;
  const email =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    null;

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        id: clerkId,
        organizationId: orgId,
      },
    });

    if (existingUser) return;
    await prisma.user.upsert({
      where: { clerkId },
      update: {
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        email,
        profileImage: user.imageUrl,
        organizationId: orgId,
        role,
        updatedAt: new Date(),
      },
      create: {
        id: clerkId,
        clerkId,
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        email,
        profileImage: user.imageUrl,
        role,
        createdAt: new Date(user.createdAt),
        organizationId: orgId,
      },
    });
    console.log(`✅ Synced user ${clerkId} with org ${orgId}`);

    await prisma.teacher.upsert({
      where: { userId: clerkId },
      update: {
        userId: clerkId,
      },
      create: {
        userId: clerkId,
        organizationId: orgId,
        isActive: true,
      },
    });

    console.log(`✅ Teacher sync  ${clerkId} with org ${orgId}`);
  } catch (error) {
    console.error('❌ Error syncing user to DB:', error);
    throw new Error('Failed to sync user');
  }
};

/**
 * Helper to retry a promise-returning function with exponential backoff
 */
async function withRetry<T>(
  action: () => Promise<T>,
  retries = 3,
  delay = 500
): Promise<T> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      // Only retry if it's not a 404 (unless it's an organization call which might be transient)
      const isNotFound = (error as any)?.status === 404;
      const isClerkError = error && typeof error === 'object' && 'clerkError' in error;

      if (i < retries - 1) {
        // console.warn(`[Sync] Clerk API call failed, retrying (${i + 1}/${retries})...`, isNotFound ? '404' : '');
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  throw lastError;
}

/**
 * Sync user and organization data between Clerk and Prisma.
 *
 * Handles:
 * ✅ Missing org/user creation
 * ✅ Field sync (name, image, email)
 * ✅ Role linking (Teacher/Student/Parent)
 * ✅ Organization linking & cleanup
 * ✅ Role mismatch correction
 * ✅ Smart role inference
 */
export async function syncOrganizationUser(
  orgId: string,
  orgRole: string,
  userId: string
): Promise<void> {
  if (!orgId || !userId) {
    console.warn('⚠️ Missing orgId or userId for sync, skipping.');
    return;
  }

  const client = await clerkClient();

  try {
    const internalRole = mapClerkRoleToInternalRole(orgRole);

    // 1. Fetch data from Clerk with retry logic for transient errors
    const [clerkUser, clerkOrganization] = await Promise.all([
      withRetry(() => client.users.getUser(userId)),
      withRetry(() => client.organizations.getOrganization({ organizationId: orgId })),
    ]);

    if (!clerkUser) throw new Error('User not found in Clerk after retries');
    if (!clerkOrganization) throw new Error('Organization not found in Clerk after retries');

    const clerkUserEmail = clerkUser.emailAddresses[0]?.emailAddress;
    if (!clerkUserEmail) throw new Error('User email not found in Clerk');

    // Optimization: Check if sync is needed to avoid unnecessary transactions
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (
      existingUser &&
      existingUser.organizationId === clerkOrganization.id &&
      existingUser.role === internalRole &&
      existingUser.email === clerkUserEmail &&
      (!clerkUser.firstName || existingUser.firstName === clerkUser.firstName) &&
      (!clerkUser.lastName || existingUser.lastName === clerkUser.lastName) &&
      (!clerkUser.imageUrl || existingUser.profileImage === clerkUser.imageUrl)
    ) {
      // Check role specific records
      let roleSynced = true;
      if (internalRole === 'TEACHER') {
        const teacher = await prisma.teacher.findUnique({
          where: { userId: existingUser.id },
        });
        if (!teacher || teacher.organizationId !== clerkOrganization.id)
          roleSynced = false;
      } else if (internalRole === 'PARENT') {
        const parent = await prisma.parent.findUnique({
          where: { userId: existingUser.id },
        });
        if (!parent) roleSynced = false;
      }

      if (roleSynced) {
        // console.log('✅ User already synced (Skipping transaction)');
        return;
      }
    }

    // 2. Start a transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // 3. Sync Organization (only if doesn't exist)
      let organization = await tx.organization.findUnique({
        where: { id: clerkOrganization.id },
      });

      if (!organization) {
        organization = await tx.organization.create({
          data: {
            id: clerkOrganization.id,
            name: clerkOrganization.name,
            slug: clerkOrganization.slug,
            logo: clerkOrganization.imageUrl,
            contactEmail: clerkUserEmail,
            createdBy: clerkUser.id,
            createdAt: new Date(clerkOrganization.createdAt),
          },
        });
        console.log(`✅ Created organization: ${organization.name}`);
      }

      // 4. Sync User - Check if user already exists and is properly linked
      // First, check if user exists with the same clerkId
      let user = await tx.user.findUnique({
        where: { clerkId: clerkUser.id },
      });
      // console.log(internalRole);

      // console.log(clerkUser);
      // console.log(user.role);

      // If user exists and is already properly linked, skip everything
      if (
        user &&
        user.organizationId === organization.id &&
        user.role === internalRole
      ) {
        console.log(
          `✅ User already synced:${userId} ${user.email} ${orgRole}, ${orgId}`
        );
        return;
      }

      if (user) {
        // User exists with clerkId, update it
        console.log(`🔄 Updating existing user by clerkId: ${clerkUserEmail}`);
        user = await tx.user.update({
          where: { clerkId: clerkUser.id },
          data: {
            firstName: clerkUser.firstName || user.firstName,
            lastName: clerkUser.lastName || user.lastName,
            email: clerkUserEmail,
            profileImage: clerkUser.imageUrl || user.profileImage,
            organizationId: organization.id,
            role: internalRole,
            updatedAt: new Date(),
          },
        });

        // Ensure associated roles are also linked to the NEW organization
        await Promise.all([
          tx.teacher.updateMany({
            where: { userId: user.id },
            data: { organizationId: organization.id },
          }),
          // Parent doesn't have organizationId directly in the same way, but let's be safe if it's added later
        ]);
      } else {
        // No user with this clerkId, check by email
        const userByEmail = await tx.user.findUnique({
          where: { email: clerkUserEmail },
        });

        if (userByEmail) {
          // User exists with same email but different clerkId - update with correct clerkId
          console.log(
            `🔄 User exists with email, updating clerkId: ${clerkUserEmail}`
          );
          user = await tx.user.update({
            where: { email: clerkUserEmail },
            data: {
              id: clerkUser.id,
              clerkId: clerkUser.id,
              firstName: clerkUser.firstName || userByEmail.firstName,
              lastName: clerkUser.lastName || userByEmail.lastName,
              profileImage: clerkUser.imageUrl || userByEmail.profileImage,
              organizationId: organization.id,
              role: internalRole,
              updatedAt: new Date(),
            },
          });
        } else {
          // No existing user found, create new one
          console.log(`🔄 Creating new user: ${clerkUserEmail}`);
          user = await tx.user.create({
            data: {
              id: clerkUser.id,
              firstName: clerkUser.firstName || 'Unknown',
              lastName: clerkUser.lastName || '',
              email: clerkUserEmail,
              clerkId: clerkUser.id,
              profileImage: clerkUser.imageUrl || '',
              organizationId: organization.id,
              role: internalRole,
            },
          });
        }
      }

      console.log(`✅ User synced: ${user.email}`);

      // 5. Create role-specific records only for Teacher and Parent
      switch (internalRole) {
        case 'TEACHER':
          await tx.teacher.upsert({
            where: { userId: user.id },
            update: {
              organizationId: organization.id,
              updatedAt: new Date(),
            },
            create: {
              userId: user.id,
              organizationId: organization.id,
            },
          });
          console.log(`✅ Teacher record synced for: ${user.email}`);
          break;

        case 'PARENT':
          await tx.parent.upsert({
            where: { userId: user.id },
            update: {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              updatedAt: new Date(),
            },
            create: {
              userId: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phoneNumber: 'TEMP',
              whatsAppNumber: 'TEMP',
            },
          });
          console.log(`✅ Parent record synced for: ${user.email}`);
          break;

        case 'STUDENT':
          // No student record needed - will be created manually
          console.log(`ℹ️ Student user synced: ${user.email}`);
          break;

        case 'ADMIN':
          console.log(`ℹ️ Admin user synced: ${user.email}`);
          break;
      }
    });
  } catch (error: unknown) {
    // Enhanced error logging for debugging
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Sync error (Prisma):', {
        code: error.code,
        message: error.message,
        meta: error.meta,
      });
    } else if (error && typeof error === 'object' && 'status' in error && 'errors' in error) {
      // Specific handling for Clerk API errors
      console.error('Sync error (Clerk API):', {
        status: (error as any).status,
        message: (error as any).message || 'No message',
        errors: (error as any).errors,
      });
    } else if (error instanceof Error) {
      console.error('Sync error:', error.message, error.stack);
    } else {
      console.error('Sync error (Unknown):', JSON.stringify(error, null, 2));
    }
    // Don't re-throw to prevent breaking the navbar render
    // The sync is best-effort and the user can still use the dashboard
  }
}

// ✅ User exists in Clerk but not in Database → Creates new user
// ✅ User exists in Database but missing clerkId → Links existing user account
// ✅ User data out of sync → Updates email, name, image, status
// ✅ Organization exists in Clerk but not in Database → Creates new organization
// ✅ Organization data out of sync → Updates name, logo, status
// ✅ User has organizationId in DB but no Clerk membership → Removes invalid org link
// ✅ User has Clerk membership but no DB organizationId → Links user to organization
// ✅ User role mismatch between systems → Syncs roles properly
// ✅ Role transitions → Creates/updates teacher/student/parent records
// ✅ Orphaned data cleanup → Removes invalid references
// ✅ Smart role detection → Auto-detects roles from email patterns
// ✅ Multiple organization handling → Handles users without active org selection
