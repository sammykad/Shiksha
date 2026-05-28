"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { AuthCard, AuthCardPanel } from "./_components/auth-card";
import { AuthFooter } from "./_components/auth-footer";
import { BrandAuthHeader } from "./_components/brand";
import { OrganizationAvatar } from "./_components/organization-avatar";

type AcceptInvitationProps = {
    invitation: {
        id: string;
        email: string;
        role: string;
        organization: {
            id: string;
            name: string;
            logo?: string | null;
        };
    };
    afterAcceptUrl?: string;
};

export function AcceptInvitation({
    invitation,
    afterAcceptUrl = "/dashboard",
}: AcceptInvitationProps) {
    const router = useRouter();
    const [isAccepting, setIsAccepting] = useState(false);
    const [accepted, setAccepted] = useState(false);

    const handleAccept = async () => {
        if (isAccepting) return;
        setIsAccepting(true);

        try {
            const { error } = await authClient.organization.acceptInvitation({
                invitationId: invitation.id,
            });

            if (error) {
                toast.error(getAuthErrorMessage(error, {
                    fallback: "Could not accept invitation. Please check the invite link and try again.",
                }));
                return;
            }

            const { error: activeOrgError } = await authClient.organization.setActive({
                organizationId: invitation.organization.id,
            });

            if (activeOrgError) {
                toast.warning(getAuthErrorMessage(activeOrgError, {
                    fallback: "Invitation accepted, but we could not switch organizations automatically.",
                }));
            } else {
                toast.success("Invitation accepted.");
            }

            setAccepted(true);
            window.setTimeout(() => {
                router.push(afterAcceptUrl);
                router.refresh();
            }, 900);
        } catch {
            toast.error("Something went wrong.");
        } finally {
            setIsAccepting(false);
        }
    };

    return (
        <AuthCard data-slot="accept-invitation">
            <AuthCardPanel>
                <BrandAuthHeader
                    title="Accept invitation"
                    description="Join this organization to continue."
                />

                <div className="flex flex-col items-center gap-5 px-8 py-7 text-center">
                    <OrganizationAvatar
                        name={invitation.organization.name}
                        logo={invitation.organization.logo}
                        size={52}
                        className="size-[52px] rounded-[10px]"
                    />

                    <div className="space-y-1">
                        <h2 className="text-[17px] font-semibold leading-6 tracking-[-0.17px] text-[#212126]">
                            {invitation.organization.name}
                        </h2>
                        <p className="text-[13px] leading-[18px] text-[#747686]">
                            Invited as {invitation.role}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-[6px] border border-black/[0.06] bg-[#f7f7f7] px-3 py-2 text-[12px] text-[#747686]">
                        <MailCheck className="size-4" />
                        <span>{invitation.email}</span>
                    </div>

                    {accepted ? (
                        <div className="flex w-full items-center justify-center gap-2 rounded-[6px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] font-[510] text-emerald-700">
                            <CheckCircle2 className="size-4" />
                            Invitation accepted. Redirecting...
                        </div>
                    ) : (
                        <button
                            type="button"
                            disabled={isAccepting}
                            onClick={handleAccept}
                            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-[6px] bg-[#372F35] px-4 text-[13px] font-[510] leading-[18px] text-white shadow-[0_1px_1px_rgba(0,0,0,0.24),0_2px_3px_rgba(0,0,0,0.20)] transition-colors hover:bg-[#2c252b] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isAccepting && <Loader2 className="size-4 animate-spin" />}
                            Accept invitation
                        </button>
                    )}
                </div>
            </AuthCardPanel>
            <AuthFooter />
        </AuthCard>
    );
}
