"use client";

import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, GraduationCap, Wallet, IndianRupee, Zap } from "lucide-react";
import BillingSummary, { type BillingSummaryData } from "./BillingSummary";
import { formatCostINR, formatCurrencyINWithSymbol, formatDateIN } from "@/lib/utils";
import { toast } from "sonner";

interface BillingSettingsProps {
    billingSummary: BillingSummaryData;
}

const formatBillingStatus = (status: string) =>
    status
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    TRIALING: "default",
    ACTIVE: "secondary",
    PAST_DUE: "destructive",
    PAUSED: "outline",
    CANCELLED: "outline",
    EXPIRED: "destructive",
};

export default function BillingSettings({ billingSummary }: BillingSettingsProps) {
    const walletBalance = billingSummary.walletBalance;
    const lowBalance = walletBalance < 20;
    const subscription = billingSummary.subscription;
    const nextBillingDate = subscription?.trialEndsAt ?? subscription?.currentPeriodEnd;

    return (
        <div className="space-y-6">

            {/* Page header */}
            <div>
                <h2 className="text-lg font-medium">Billing &amp; Usage</h2>
                <p className="text-sm text-muted-foreground">
                    Plan details, wallet balance, and usage breakdown.
                </p>
            </div>

            {/* ── Plan Section ── */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Plan</CardTitle>
                            {subscription ? (
                                <>
                                    <p className="text-xl font-semibold">
                                        {subscription.planName}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {subscription.billingCycle.toLowerCase() === "monthly"
                                            ? "Billed monthly"
                                            : "Billed annually"}
                                        {subscription.offerName && (
                                            <> &middot; <span className="font-medium text-primary">{subscription.offerName}</span></>
                                        )}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-xl font-semibold text-muted-foreground">
                                        No plan selected
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Choose a plan to get started.
                                    </p>
                                </>
                            )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            {subscription ? (
                                <Badge variant={STATUS_VARIANTS[subscription.status] ?? "secondary"}>
                                    {formatBillingStatus(subscription.status)}
                                </Badge>
                            ) : (
                                <Badge variant="secondary">Inactive</Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    {subscription ? (
                        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                            <div className="space-y-1">
                                <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                    <GraduationCap className="h-3 w-3" />
                                    Students
                                </p>
                                <p className="text-lg font-semibold tabular-nums">
                                    {subscription.studentCount.toLocaleString("en-IN")}
                                    {subscription.studentLimit && (
                                        <span className="text-sm font-normal text-muted-foreground">
                                            {" "}/ {subscription.studentLimit.toLocaleString("en-IN")}
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                    <CalendarDays className="h-3 w-3" />
                                    Next billing
                                </p>
                                <p className="text-lg font-semibold tabular-nums">
                                    {nextBillingDate ? formatDateIN(nextBillingDate) : "—"}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                    <IndianRupee className="h-3 w-3" />
                                    Next invoice
                                </p>
                                <p className="text-lg font-semibold tabular-nums">
                                    {formatCurrencyINWithSymbol(subscription.nextInvoiceAmount)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                    <Zap className="h-3 w-3" />
                                    Usage
                                </p>
                                <p className="text-lg font-semibold tabular-nums">
                                    {formatCostINR(billingSummary.totalCost)}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                            No subscription has been created for this organization yet.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* ── Wallet Section ── */}
            <Card className={lowBalance ? "border-destructive/50" : ""}>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Wallet</CardTitle>
                    <CardDescription>
                        Credits fund notification delivery. Balance refreshes on top-up.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <p className={`text-2xl font-semibold tabular-nums ${lowBalance ? "text-destructive" : ""}`}>
                                {formatCostINR(walletBalance)}
                            </p>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                                Available credits
                            </p>
                            {lowBalance && (
                                <p className="mt-1.5 text-sm text-destructive">
                                    Low balance &mdash; notifications will be blocked at ₹0.
                                </p>
                            )}
                        </div>

                        <Button
                            variant={lowBalance ? "destructive" : "outline"}
                            className="shrink-0"
                            onClick={() => {
                                toast.info("Contact for Wallet Top-up", {
                                    description: "Call 8459324821 to add credits to your wallet",
                                    duration: 10000,
                                });
                                window.location.href = "tel:8459324821";
                            }}
                        >
                            <Wallet className="mr-2 h-4 w-4" />
                            Top-up
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* ── Usage Section ── */}
            <div className="space-y-3">
                <div>
                    <h3 className="font-medium">Usage Breakdown</h3>
                    <p className="text-sm text-muted-foreground">
                        Notification volume and storage across channels.
                    </p>
                </div>
                <BillingSummary data={billingSummary} />
            </div>

        </div>
    );
}
