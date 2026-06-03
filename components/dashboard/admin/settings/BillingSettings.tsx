"use client";

import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, GraduationCap, Wallet } from "lucide-react";
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

export default function BillingSettings({ billingSummary }: BillingSettingsProps) {
    const walletBalance = billingSummary.walletBalance;
    const lowBalance = walletBalance < 20;
    const subscription = billingSummary.subscription;
    const nextBillingDate = subscription?.trialEndsAt ?? subscription?.currentPeriodEnd;

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h2 className="text-lg font-medium">Billing &amp; Usage</h2>
                <p className="text-sm text-muted-foreground">
                    Monitor your usage, billing information, and API quotas.
                </p>
            </div>

            {/* Plan information */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <CardTitle>Subscription</CardTitle>
                            <CardDescription>Your current plan, offer, and billing cycle</CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {subscription ? (
                                <Badge variant={subscription.status === "TRIALING" ? "default" : "secondary"}>
                                    {formatBillingStatus(subscription.status)}
                                </Badge>
                            ) : (
                                <Badge variant="secondary">No subscription</Badge>
                            )}
                            {subscription?.offerName && (
                                <Badge variant="outline">{subscription.offerName}</Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div>
                            <p className="text-sm font-medium">Current Plan</p>
                            <p className="text-sm text-muted-foreground">
                                {subscription
                                    ? `${subscription.planName} / ${subscription.billingCycle.toLowerCase()}`
                                    : "Not selected yet"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Students</p>
                            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <GraduationCap className="h-3.5 w-3.5" />
                                {subscription?.studentCount ?? 0}
                                {subscription?.studentLimit ? ` / ${subscription.studentLimit}` : ""}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Next Billing Date</p>
                            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {nextBillingDate ? formatDateIN(nextBillingDate) : "Not set"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Estimated Invoice</p>
                            <p className="text-sm text-muted-foreground">
                                {subscription
                                    ? formatCurrencyINWithSymbol(subscription.nextInvoiceAmount)
                                    : "Not generated yet"}
                            </p>
                        </div>
                    </div>
                    {!subscription && (
                        <p className="mt-4 rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                            No subscription has been created for this organization yet.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Wallet status */}
            <Card className={lowBalance ? "border-destructive/50" : ""}>
                <CardHeader>
                    <CardTitle>Organization Wallet</CardTitle>
                    <CardDescription>
                        Credits are deducted when notifications are sent. Balance reflects actual remaining funds.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Available balance</p>
                            <p className={`mt-0.5 text-3xl font-semibold tabular-nums ${lowBalance ? "text-destructive" : ""}`}>
                                {formatCostINR(walletBalance)}
                            </p>
                            {lowBalance && (
                                <p className="mt-1 text-sm text-destructive">
                                    Balance is low — notifications will be blocked when it reaches ₹0.
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
                            Top-up Now
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Usage breakdown */}
            <BillingSummary data={billingSummary} />

        </div>
    );
}
