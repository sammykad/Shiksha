import { SheetMenu } from "@/components/dashboard-layout/sheet-menu";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AcademicYearSwitcher } from "../AcademicYearSwitcher";
import { AdminOnboardingGuide } from "../AdminOnboardingGuide";
import NotificationBanner from "./notification-banner";
import type { Role } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth";
import { getOnboardingProgress } from "@/lib/onboarding";
import { RoleBadge } from "@/components/auth/role-badge";
import { UserButton } from "@/components/auth/user-button";
import NotificationPanel from "./notification-panel";

export async function Navbar() {
  const { user, orgRole } = await auth();

  const role: Role = orgRole as Role;
  const firstName = user.firstName ?? "User";
  const lastName = user.lastName ?? "";
  const fullName = `${firstName} ${lastName}`.trim();
  const onboardingProgress =
    orgRole === "ADMIN" ? await getOnboardingProgress() : null;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-[env(safe-area-inset-top)] flex flex-col">
        <div className="flex h-16 items-center px-4">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            <SheetMenu role={role} />

            <div className="flex items-center space-x-3">
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold leading-none">
                  Dashboard
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-muted-foreground leading-4 truncate max-sm:max-w-[100px]">
                    {fullName}
                  </span>
                  <RoleBadge role={orgRole} />
                </div>
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className="ml-auto flex items-center space-x-3">
            <Suspense
              fallback={<Skeleton className="h-8 w-24 rounded-full" />}
            >
              <AcademicYearSwitcher />
            </Suspense>

            {orgRole === "ADMIN" && (
              <div className="hidden sm:block">
                <Suspense fallback={<Skeleton className="h-8 w-12 rounded-lg" />}>
                  <AdminOnboardingGuide initialData={onboardingProgress} />
                </Suspense>
              </div>
            )}

            <Suspense fallback={<Skeleton className="size-10 rounded-full" />}>
              <NotificationPanel />
            </Suspense>

            <UserButton
              user={{
                firstName: user.firstName,
                lastName: user.lastName,
                name: user.name,
                email: user.email,
                image: user.image,
              }}
            />
          </div>
        </div>
        {orgRole === "ADMIN" && (
          <div className="border-t px-4 py-2 sm:hidden">
            <Suspense fallback={<Skeleton className="h-9 w-full rounded-lg" />}>
              <AdminOnboardingGuide
                initialData={onboardingProgress}
                variant="mobile"
              />
            </Suspense>
          </div>
        )}
        <NotificationBanner />
      </header>

      <Separator className="mb-4" />

    </>
  );
}
