"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LifeBuoy, Phone } from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { BILLING_CONTACT } from "@/constants";

const ROLE_LABELS: Record<string, string> = {
  student: "student",
  teacher: "teacher",
  parent: "parent",
};

export default function MissingProfilePage() {
  const searchParams = useSearchParams();
  const { data: session } = authClient.useSession();
  const { data: activeOrg } = authClient.useActiveOrganization();
  const [dialogOpen, setDialogOpen] = useState(false);

  const currentMember = activeOrg?.members?.find(
    (m) => m.userId === session?.user?.id
  );
  const orgRole = currentMember?.role ?? session?.session?.activeOrganizationId ? "STUDENT" : "";

  const roleParam = searchParams.get("role") ?? "";
  const profileRole = ROLE_LABELS[roleParam.toLowerCase()] ?? orgRole.toLowerCase();

  if (!session || !activeOrg) return null;

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Profile not linked</CardTitle>
          <CardDescription>
            Your account has {orgRole} access in this organization, but the matching {profileRole} profile
            record has not been created or linked yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
          <p>
            Ask an organization admin to create the {profileRole} record from the correct module and link it
            to this user account. Inviting a user with a role only creates membership access; it does not
            create the full school profile with grade, section, children, or staff details.
          </p>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t px-6 py-4">
          <Link
            href="/select-organization?clear=true&returnUrl=/dashboard"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Switch organization
          </Link>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <LifeBuoy className="h-4 w-4" />
                Need help?
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Contact support</DialogTitle>
                <DialogDescription>
                  Your {profileRole} profile record needs to be created or linked by your school admin. If
                  you are unable to reach them, contact our support team for assistance.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 text-sm">
                <div className="flex items-center gap-3">
                  <Phone className="size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{BILLING_CONTACT.name}</p>
                    <p className="text-xs text-muted-foreground">Support Specialist</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <a
                    href={`tel:${BILLING_CONTACT.phone}`}
                    className="font-medium tabular-nums text-primary hover:underline"
                  >
                    {BILLING_CONTACT.phone}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{BILLING_CONTACT.email}</span>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Close
                </Button>
                <Button variant="default" onClick={() => window.open(`tel:${BILLING_CONTACT.phone}`)}>
                  <Phone className="size-4" />
                  Call {BILLING_CONTACT.name}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
}
