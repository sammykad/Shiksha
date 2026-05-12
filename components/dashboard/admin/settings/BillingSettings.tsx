"use client";

import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import BillingSummary, { BillingSummaryData } from "./BillingSummary";
import { formatCostINR } from "@/lib/utils";
import { Organization } from "@/generated/prisma/client";
import { toast } from "sonner";

interface BillingSettingsProps {
    organization: Organization;
    billingSummary: BillingSummaryData;
}

export default function BillingSettings({ organization, billingSummary }: BillingSettingsProps) {
    const walletBalance = billingSummary.walletBalance;
    const lowBalance = walletBalance < 20;

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
            {organization && (
                <Card>
                    <CardHeader>
                        <CardTitle>Plan Information</CardTitle>
                        <CardDescription>Your current subscription details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <p className="text-sm font-medium">Current Plan</p>
                                <p className="text-sm text-muted-foreground">{organization.plan ?? "Free"}</p>
                            </div>
                            {organization.planStartedAt && (
                                <div>
                                    <p className="text-sm font-medium">Plan Started</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(organization.planStartedAt).toLocaleDateString("en-IN")}
                                    </p>
                                </div>
                            )}
                            {organization.planExpiresAt && (
                                <div>
                                    <p className="text-sm font-medium">Plan Expires</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(organization.planExpiresAt).toLocaleDateString("en-IN")}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

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