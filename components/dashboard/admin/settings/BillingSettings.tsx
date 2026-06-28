"use client";

import { useMemo, useState } from "react";
import { downloadSubscriptionInvoicePdf } from "@/lib/data/billing/download-subscription-invoice";
import { createBlobFromBase64, downloadBlob } from "@/lib/pdf-generator/pdf";
import {
    AlertTriangle,
    CreditCard,
    Download,
    GraduationCap,
    MessageCircle,
    Receipt,
    Sparkles,
    Wallet,
    Phone,
} from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCostINR, formatCurrencyINWithSymbol, formatDateIN } from "@/lib/utils";
import { BILLING_CONTACT } from "@/constants";
import { BillingCycle, InvoiceStatus, SubscriptionPaymentStatus, SubscriptionStatus } from "@/generated/prisma/enums";
import BillingSummary, { type BillingSummaryData } from "./BillingSummary";

export type BillingPlanOption = {
    code: string;
    name: string;
    description: string;
    monthlyPrice: number;
    annualPrice: number;
    studentLimit: number;
};

interface BillingSettingsProps {
    billingSummary: BillingSummaryData;
    plans: BillingPlanOption[];
}

type BillingDialog = "plan" | "top-up" | "invoice" | null;

const formatBillingStatus = (status: string) => {
    if (status === SubscriptionStatus.TRIALING) return "Trial";
    return status
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
};

const STATUS_VARIANTS: Record<string, "pending" | "secondary" | "outline" | "destructive"> = {
    [SubscriptionStatus.TRIALING]: "pending",
    [SubscriptionStatus.ACTIVE]: "secondary",
    [SubscriptionStatus.PAST_DUE]: "destructive",
    [SubscriptionStatus.PAUSED]: "outline",
    [SubscriptionStatus.CANCELLED]: "outline",
    [SubscriptionStatus.EXPIRED]: "destructive",
};

const WALLET_LOW_BALANCE_THRESHOLD = 20;

function EmptyBillingRow({ label }: { label: string }) {
    return (
        <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-5 text-center text-sm text-muted-foreground">
            {label}
        </div>
    );
}

export default function BillingSettings({ billingSummary, plans }: BillingSettingsProps) {
    const [activeDialog, setActiveDialog] = useState<BillingDialog>(null);

    const walletBalance = billingSummary.walletBalance;
    const lowBalance = walletBalance < WALLET_LOW_BALANCE_THRESHOLD;
    const subscription = billingSummary.subscription;
    const nextBillingDate = subscription?.trialEndsAt ?? subscription?.currentPeriodEnd;
    const studentLimit = subscription?.studentLimit ?? 0;
    const studentCount = subscription?.studentCount ?? 0;
    const usagePercent = studentLimit > 0 ? Math.min(100, Math.round((studentCount / studentLimit) * 100)) : 0;

    const activePlan = useMemo(
        () => plans.find((plan) => plan.code === subscription?.planCode),
        [plans, subscription?.planCode]
    );

    const subscriptionCycle = subscription?.billingCycle ?? BillingCycle.MONTHLY;
    const activePlanPrice = activePlan
        ? (subscriptionCycle === BillingCycle.ANNUAL ? activePlan.annualPrice : activePlan.monthlyPrice)
        : 0;

    const subscriptionPricingMode = subscription?.pricingMode;
    const subscriptionBillingMetric = subscription?.billingMetric;

    const unitLabel = subscriptionBillingMetric === "STUDENT"
        ? "/student/"
        : subscriptionPricingMode === "CUSTOM_PER_USER"
            ? "/user/"
            : "/";

    const cycleSuffix = subscriptionCycle === BillingCycle.ANNUAL ? "year" : "month";

    const displayPrice = activePlan
        ? activePlanPrice
        : (subscription?.unitPrice ?? subscription?.customPrice ?? subscription?.price ?? 0);

    const currentCycleLabel = subscription?.billingCycle === BillingCycle.ANNUAL ? "Billed annually" : "Billed monthly";

    const callBilling = () => {
        window.open(`tel:${BILLING_CONTACT.phone}`);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">Billing & Usage</h2>
                        <p className="text-sm text-muted-foreground">
                            Manage plan, invoices, wallet credits, and notification usage.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => setActiveDialog("invoice")}>
                            <Receipt className="h-4 w-4" />
                            Invoices
                        </Button>
                        <Button variant="default" size="sm" onClick={() => setActiveDialog("plan")}>
                            <Sparkles className="h-4 w-4" />
                            Upgrade plan
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
                <section className="flex flex-col gap-5 rounded-lg border bg-card p-5">
                    {subscription ? (
                        <>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant={STATUS_VARIANTS[subscription.status] ?? "secondary"}>
                                    {formatBillingStatus(subscription.status)}
                                </Badge>
                                {subscription.offerName ? <Badge variant="secondary">{subscription.offerName}</Badge> : null}
                                <Badge variant={subscription.billingCycle === BillingCycle.ANNUAL ? "premium" : "secondary"}>
                                    {subscription.billingCycle === BillingCycle.ANNUAL && activePlan ? "20% off" : subscription.billingCycle === BillingCycle.ANNUAL ? "Annual" : "Billed monthly"}
                                </Badge>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold">{subscription.planName}</h3>
                                {activePlan ? (
                                    <p className="text-sm text-muted-foreground">{activePlan.description}</p>
                                ) : null}
                            </div>

                            <div className="flex items-baseline gap-1.5">
                                <span className="text-3xl font-bold tabular-nums">
                                    {formatCurrencyINWithSymbol(displayPrice)}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {unitLabel}{cycleSuffix}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                                <span className="text-muted-foreground">Up to <strong>{subscription.studentLimit?.toLocaleString("en-IN") ?? "-"}</strong> students</span>
                                <span className="text-muted-foreground">
                                    Next invoice: <strong>{formatCurrencyINWithSymbol(subscription.nextInvoiceAmount)}</strong>
                                </span>
                                <span className="text-muted-foreground">
                                    Due <strong>{nextBillingDate ? formatDateIN(nextBillingDate) : "-"}</strong>
                                </span>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <GraduationCap className="h-4 w-4" />
                                    <span>{studentCount.toLocaleString("en-IN")} / {subscription.studentLimit?.toLocaleString("en-IN") ?? "-"} students</span>
                                </div>
                                <span className="text-sm font-medium tabular-nums">{usagePercent}%</span>
                            </div>
                            <Progress value={usagePercent} className="h-1.5" />
                        </>
                    ) : (
                        <>
                            <div className="flex flex-col gap-3">
                                <Badge variant="outline">Inactive</Badge>
                                <h3 className="text-xl font-semibold text-muted-foreground">No plan selected</h3>
                                <p className="text-sm text-muted-foreground">Choose a plan to activate billing for this organization.</p>
                            </div>
                            <Button variant="default" className="w-fit" onClick={() => setActiveDialog("plan")}>
                                <Sparkles className="h-4 w-4" />
                                View plans
                            </Button>
                        </>
                    )}
                </section>

                <section className="flex flex-col gap-4 rounded-lg border bg-card p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h3 className="text-base font-semibold">Wallet</h3>
                            <p className="text-sm text-muted-foreground">Credits for notification delivery.</p>
                        </div>
                        <Badge variant={lowBalance ? "destructive" : "verified"}>
                            {lowBalance ? "Low balance" : "Healthy"}
                        </Badge>
                    </div>

                    <p className={`text-2xl font-semibold tabular-nums ${lowBalance ? "text-destructive" : ""}`}>
                        {formatCostINR(walletBalance)}
                    </p>

                    <Separator />

                    <p className="text-xs text-muted-foreground">
                        Top-ups are handled manually. Contact {BILLING_CONTACT.name} to add credits.
                    </p>

                    <Button variant={lowBalance ? "destructive" : "secondary"} onClick={() => setActiveDialog("top-up")}>
                        <Wallet className="h-4 w-4" />
                        Top-up wallet
                    </Button>
                </section>
            </div>

            {lowBalance ? (
                <Alert variant="warning">
                    <AlertTriangle className="size-4" />
                    <AlertTitle>Wallet balance is low</AlertTitle>
                    <AlertDescription>
                        Notification delivery can be blocked once the wallet reaches zero. Top-up or contact billing before fee and attendance reminders run.
                    </AlertDescription>
                </Alert>
            ) : null}

            <Tabs defaultValue="usage" className="flex flex-col gap-4">
                <TabsList className="w-full justify-start overflow-x-auto sm:w-fit">
                    <TabsTrigger value="usage">Usage</TabsTrigger>
                    <TabsTrigger value="invoices">Invoices</TabsTrigger>
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="usage" className="mt-0">
                    <BillingSummary data={billingSummary} />
                </TabsContent>

                <TabsContent value="invoices" className="mt-0">
                    <div className="flex flex-col gap-3 rounded-lg border bg-card p-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h3 className="text-base font-semibold">Invoices</h3>
                                <p className="text-sm text-muted-foreground">Review billing periods and download PDFs.</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setActiveDialog("invoice")}>
                                <Receipt className="h-4 w-4" />
                                View all
                            </Button>
                        </div>
                        {billingSummary.recentInvoices.length ? (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[560px] text-sm">
                                    <thead className="text-left text-muted-foreground">
                                        <tr className="border-b">
                                            <th className="pb-2 font-medium">Period</th>
                                            <th className="pb-2 font-medium">Status</th>
                                            <th className="pb-2 text-right font-medium">Total</th>
                                            <th className="pb-2 text-right font-medium">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {billingSummary.recentInvoices.map((invoice) => (
                                            <tr key={invoice.id} className="border-b last:border-0">
                                                <td className="py-2.5 text-sm">
                                                    {formatDateIN(invoice.periodStart)} &ndash; {formatDateIN(invoice.periodEnd)}
                                                </td>
                                                <td className="py-2.5">
                                                    <Badge variant={invoice.status === InvoiceStatus.PAID ? "secondary" : "outline"}>
                                                        {formatBillingStatus(invoice.status)}
                                                    </Badge>
                                                </td>
                                                <td className="py-2.5 text-right text-sm tabular-nums font-medium">
                                                    {formatCurrencyINWithSymbol(invoice.total)}
                                                </td>
                                                <td className="py-2.5 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={async () => {
                                                            try {
                                                                const result = await downloadSubscriptionInvoicePdf(invoice.id);
                                                                if (!result.success) {
                                                                    throw new Error(result.error);
                                                                }
                                                                const blob = createBlobFromBase64(result.base64);
                                                                if (!blob) throw new Error("Invalid PDF data");
                                                                downloadBlob(blob, result.filename);
                                                            } catch {
                                                                toast.error("Failed to download invoice PDF");
                                                            }
                                                        }}
                                                    >
                                                        <Download className="h-4 w-4" />
                                                        PDF
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <EmptyBillingRow label="No invoices have been generated yet." />
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="payments" className="mt-0">
                    <div className="flex flex-col gap-3 rounded-lg border bg-card p-5">
                        <div>
                            <h3 className="text-base font-semibold">Payments</h3>
                            <p className="text-sm text-muted-foreground">Subscription payment history from all gateways.</p>
                        </div>
                        {billingSummary.recentPayments.length ? (
                            <div className="grid gap-2">
                                {billingSummary.recentPayments.map((payment) => (
                                    <div key={payment.id} className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg border bg-muted p-2">
                                                <CreditCard className="size-4 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{payment.provider}</p>
                                                <p className="text-xs text-muted-foreground">{formatDateIN(payment.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold tabular-nums">{formatCurrencyINWithSymbol(payment.amount)}</p>
                                            <Badge variant={payment.status === SubscriptionPaymentStatus.SUCCESS ? "secondary" : "outline"}>
                                                {formatBillingStatus(payment.status)}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyBillingRow label="No subscription payments recorded yet." />
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="activity" className="mt-0">
                    <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
                        <div className="flex flex-col gap-3 rounded-lg border bg-card p-5">
                            <h3 className="text-base font-semibold">Quick actions</h3>
                            <div className="grid gap-2 sm:grid-cols-3">
                                <Button variant="outline" className="justify-start gap-2" onClick={() => setActiveDialog("plan")}>
                                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-left">Upgrade plan</span>
                                </Button>
                                <Button variant="outline" className="justify-start gap-2" onClick={() => setActiveDialog("invoice")}>
                                    <Receipt className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-left">View invoices</span>
                                </Button>
                                <Button variant="outline" className="justify-start gap-2" onClick={callBilling}>
                                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-left">Contact billing</span>
                                </Button>
                            </div>

                            <Separator className="my-1" />

                            {subscription ? (
                                <div className="flex flex-col gap-3">
                                    <h4 className="text-sm font-medium">Subscription timeline</h4>
                                    <div className="flex flex-col gap-2 text-sm">
                                        {subscription.trialEndsAt ? (
                                            <div className="flex items-center gap-2">
                                                <span className="size-2 rounded-full bg-primary" />
                                                <span className="text-muted-foreground">Trial ends</span>
                                                <span className="ml-auto">{formatDateIN(subscription.trialEndsAt)}</span>
                                            </div>
                                        ) : null}
                                        <div className="flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-amber-500" />
                                            <span className="text-muted-foreground">Current period ends</span>
                                            <span className="ml-auto font-medium">
                                                {subscription.currentPeriodEnd ? formatDateIN(subscription.currentPeriodEnd) : "—"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-muted-foreground" />
                                            <span className="text-muted-foreground">Renewal</span>
                                            <span className="ml-auto">
                                                {subscription.status === SubscriptionStatus.TRIALING ? "After trial" : "Auto-renew"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <EmptyBillingRow label="No active subscription to track." />
                            )}
                        </div>

                        <div className="flex flex-col gap-3 rounded-lg border bg-card p-5">
                            <h3 className="text-base font-semibold">Account</h3>
                            <div className="flex flex-col gap-2 text-sm">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-muted-foreground">Plan</span>
                                    <span className="font-medium">{subscription?.planName ?? "-"}</span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-muted-foreground">Status</span>
                                    <Badge variant={subscription ? STATUS_VARIANTS[subscription.status] ?? "secondary" : "outline"} className="text-[10px]">
                                        {subscription ? formatBillingStatus(subscription.status) : "Inactive"}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-muted-foreground">Cycle</span>
                                    <span className="font-medium">{currentCycleLabel}</span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-muted-foreground">Students</span>
                                    <span className="font-medium tabular-nums">
                                        {subscription ? studentCount.toLocaleString("en-IN") : "0"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            <Dialog open={activeDialog === "plan"} onOpenChange={(open) => setActiveDialog(open ? "plan" : null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Upgrade plan</DialogTitle>
                        <DialogDescription>
                            Plan changes require manual processing. Get in touch with our billing team to discuss upgrading, downgrading, or custom pricing for your institution.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 text-sm">
                        <div className="flex items-center gap-3">
                            <Phone className="size-4 shrink-0 text-muted-foreground" />
                            <div>
                                <p className="font-medium">{BILLING_CONTACT.name}</p>
                                <p className="text-xs text-muted-foreground">Billing Specialist</p>
                            </div>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Phone</span>
                            <a href={`tel:${BILLING_CONTACT.phone}`} className="font-medium tabular-nums text-primary hover:underline">
                                {BILLING_CONTACT.phone}
                            </a>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Email</span>
                            <span className="font-medium">{BILLING_CONTACT.email}</span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActiveDialog(null)}>
                            Close
                        </Button>
                        <Button variant="default" onClick={callBilling}>
                            <Phone className="size-4" />
                            Call {BILLING_CONTACT.name}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={activeDialog === "top-up"} onOpenChange={(open) => setActiveDialog(open ? "top-up" : null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Top-up wallet</DialogTitle>
                        <DialogDescription>
                            Wallet top-ups require manual processing. Contact our billing team to add credits to your notification wallet.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 text-sm">
                        <div className="flex items-center gap-3">
                            <Phone className="size-4 shrink-0 text-muted-foreground" />
                            <div>
                                <p className="font-medium">{BILLING_CONTACT.name}</p>
                                <p className="text-xs text-muted-foreground">Billing Specialist</p>
                            </div>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Phone</span>
                            <a href={`tel:${BILLING_CONTACT.phone}`} className="font-medium tabular-nums text-primary hover:underline">
                                {BILLING_CONTACT.phone}
                            </a>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Email</span>
                            <span className="font-medium">{BILLING_CONTACT.email}</span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActiveDialog(null)}>
                            Close
                        </Button>
                        <Button variant="default" onClick={callBilling}>
                            <Phone className="size-4" />
                            Call {BILLING_CONTACT.name}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={activeDialog === "invoice"} onOpenChange={(open) => setActiveDialog(open ? "invoice" : null)}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Invoice center</DialogTitle>
                        <DialogDescription>
                            Review and manage your organization&apos;s invoices.
                        </DialogDescription>
                    </DialogHeader>

                    {billingSummary.recentInvoices.length ? (
                        <div className="flex flex-col gap-2">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[500px] text-sm">
                                    <thead className="text-left text-muted-foreground">
                                        <tr className="border-b">
                                            <th className="pb-2 font-medium">Period</th>
                                            <th className="pb-2 font-medium">Status</th>
                                            <th className="pb-2 text-right font-medium">Total</th>
                                            <th className="pb-2 text-right font-medium">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {billingSummary.recentInvoices.map((invoice) => (
                                            <tr key={invoice.id} className="border-b last:border-0">
                                                <td className="py-2.5 text-sm">
                                                    {formatDateIN(invoice.periodStart)} &ndash; {formatDateIN(invoice.periodEnd)}
                                                </td>
                                                <td className="py-2.5">
                                                    <Badge variant={invoice.status === InvoiceStatus.PAID ? "secondary" : "outline"}>
                                                        {formatBillingStatus(invoice.status)}
                                                    </Badge>
                                                </td>
                                                <td className="py-2.5 text-right text-sm tabular-nums font-medium">
                                                    {formatCurrencyINWithSymbol(invoice.total)}
                                                </td>
                                                <td className="py-2.5 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={async () => {
                                                            try {
                                                                const result = await downloadSubscriptionInvoicePdf(invoice.id);
                                                                if (!result.success) {
                                                                    throw new Error(result.error);
                                                                }
                                                                const blob = createBlobFromBase64(result.base64);
                                                                if (!blob) throw new Error("Invalid PDF data");
                                                                downloadBlob(blob, result.filename);
                                                            } catch {
                                                                toast.error("Failed to download invoice PDF");
                                                            }
                                                        }}
                                                    >
                                                        <Download className="h-4 w-4" />
                                                        PDF
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
                            No invoices have been generated yet.
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActiveDialog(null)}>
                            Close
                        </Button>
                        <Button variant="default" onClick={callBilling}>
                            <MessageCircle className="h-4 w-4" />
                            Contact billing
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}


