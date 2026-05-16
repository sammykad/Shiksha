import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AcceptInvitation } from "@/components/auth/accept-invitation";
import { getSessionOrNull } from "@/lib/auth";
import { getSafeAuthCallbackUrl } from "@/lib/auth-navigation";
import prisma from "@/lib/db";

export const metadata: Metadata = {
    title: "Accept Invitation | Shiksha Cloud",
    description: "Accept your organization invitation on Shiksha Cloud.",
    robots: {
        index: false,
        follow: false,
    },
};

export default async function AcceptInvitationPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ returnUrl?: string | string[] }>;
}) {
    const { id } = await params;
    const session = await getSessionOrNull();
    const callbackUrl = `/accept-invitation/${encodeURIComponent(id)}`;

    if (!session) {
        redirect(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }

    const invitation = await prisma.invitation.findUnique({
        where: { id },
        include: {
            organization: {
                select: {
                    id: true,
                    name: true,
                    logo: true,
                },
            },
        },
    });

    const paramsValue = await searchParams;
    const requestedReturnUrl = Array.isArray(paramsValue.returnUrl)
        ? paramsValue.returnUrl[0]
        : paramsValue.returnUrl;
    const returnUrl = getSafeAuthCallbackUrl(requestedReturnUrl);

    if (!invitation) {
        return (
            <InvitationMessage
                title="Invitation not found"
                description="This invitation link does not match an active invitation."
            />
        );
    }

    const status = invitation.status.toLowerCase();
    if (invitation.expiresAt < new Date()) {
        return (
            <InvitationMessage
                title="Invitation expired"
                description="Ask an organization admin to send a fresh invitation."
            />
        );
    }

    if (status === "cancelled" || status === "canceled") {
        return (
            <InvitationMessage
                title="Invitation cancelled"
                description="This invitation was revoked by an organization admin."
            />
        );
    }

    if (status === "accepted") {
        return (
            <InvitationMessage
                title="Invitation already accepted"
                description="This invitation has already been used. Continue to your dashboard."
                actionHref="/dashboard"
                actionLabel="Go to dashboard"
            />
        );
    }

    if (status !== "pending") {
        return (
            <InvitationMessage
                title="Invitation unavailable"
                description="This invitation is no longer available."
            />
        );
    }

    if (invitation.email.toLowerCase() !== session.user.email.toLowerCase()) {
        return (
            <InvitationMessage
                title="Wrong account"
                description={`This invitation was sent to ${invitation.email}. Sign in with that email to accept it.`}
                actionHref={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                actionLabel="Sign in with invited email"
            />
        );
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50/50 p-4">
            <AcceptInvitation
                invitation={{
                    id: invitation.id,
                    email: invitation.email,
                    role: invitation.role,
                    organization: invitation.organization,
                }}
                afterAcceptUrl={returnUrl}
            />
        </main>
    );
}

function InvitationMessage({
    title,
    description,
    actionHref,
    actionLabel,
}: {
    title: string;
    description: string;
    actionHref?: string;
    actionLabel?: string;
}) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50/50 p-4">
            <div className="w-full max-w-[400px] rounded-[8px] border bg-white p-8 text-center shadow-sm">
                <h1 className="text-[17px] font-semibold text-[#212126]">{title}</h1>
                <p className="mt-2 text-[13px] leading-[18px] text-[#747686]">
                    {description}
                </p>
                {actionHref && actionLabel ? (
                    <Link
                        href={actionHref}
                        className="mt-6 inline-flex h-9 items-center justify-center rounded-[6px] bg-[#372F35] px-4 text-[13px] font-[510] text-white hover:bg-[#2c252b]"
                    >
                        {actionLabel}
                    </Link>
                ) : null}
            </div>
        </main>
    );
}
