"use client";

import { useMemo, useState } from "react";
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formatCostINR, formatCurrencyINWithSymbol, formatDateIN } from "@/lib/utils";
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
type BillingCycleChoice = "MONTHLY" | "ANNUAL";

const formatBillingStatus = (status: string) => {
    if (status === "TRIALING") return "Trial";
    return status
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
};

const STATUS_VARIANTS: Record<string, "pending" | "secondary" | "outline" | "destructive"> = {
    TRIALING: "pending",
    ACTIVE: "secondary",
    PAST_DUE: "destructive",
    PAUSED: "outline",
    CANCELLED: "outline",
    EXPIRED: "destructive",
};

const CONTACT_PHONE = "8459324821";
const WALLET_LOW_BALANCE_THRESHOLD = 20;

const topUpAmounts = [100, 1000, 2500, 5000];

function TimelineItem({
    title,
    description,
    status,
}: {
    title: string;
    description: string;
    status: "done" | "current" | "pending";
}) {
    return (
        <div className="flex gap-3">
            <div
                className={cn(
                    "mt-0.5 flex size-6 items-center justify-center rounded-full border",
                    status === "done" && "border-primary bg-primary text-primary-foreground",
                    status === "current" && "border-primary bg-background text-primary",
                    status === "pending" && "border-border bg-muted text-muted-foreground"
                )}
            >
                {status === "done" ? <CheckCircle2 className="size-3.5" /> : <span className="size-1.5 rounded-full bg-current" />}
            </div>
            <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}

function EmptyBillingRow({ label }: { label: string }) {
    return (
        <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-5 text-center text-sm text-muted-foreground">
            {label}
        </div>
    );
}

export default function BillingSettings({ billingSummary, plans }: BillingSettingsProps) {
    const [activeDialog, setActiveDialog] = useState<BillingDialog>(null);
    const [selectedPlanCode, setSelectedPlanCode] = useState(
        billingSummary.subscription?.planCode ?? plans[0]?.code ?? ""
    );
    const [billingCycle, setBillingCycle] = useState<BillingCycleChoice>(
        billingSummary.subscription?.billingCycle === "ANNUAL" ? "ANNUAL" : "MONTHLY"
    );
    const [autoRecharge, setAutoRecharge] = useState(false);
    const [selectedTopUp, setSelectedTopUp] = useState(topUpAmounts[1]);

    const walletBalance = billingSummary.walletBalance;
    const lowBalance = walletBalance < WALLET_LOW_BALANCE_THRESHOLD;
    const subscription = billingSummary.subscription;
    const nextBillingDate = subscription?.trialEndsAt ?? subscription?.currentPeriodEnd;
    const studentLimit = subscription?.studentLimit ?? 0;
    const studentCount = subscription?.studentCount ?? 0;
    const usagePercent = studentLimit > 0 ? Math.min(100, Math.round((studentCount / studentLimit) * 100)) : 0;

    const selectedPlan = useMemo(
        () => plans.find((plan) => plan.code === selectedPlanCode) ?? plans[0],
        [plans, selectedPlanCode]
    );

    const planPrice = selectedPlan
        ? billingCycle === "ANNUAL"
            ? selectedPlan.annualPrice
            : selectedPlan.monthlyPrice
        : 0;

    const hasPendingPlanChange =
        Boolean(selectedPlan) &&
        (selectedPlan?.code !== subscription?.planCode || billingCycle !== subscription?.billingCycle);

    const currentCycleLabel = subscription?.billingCycle === "ANNUAL" ? "Billed annually" : "Billed monthly";

    const openPhone = () => {
        toast.info("Connecting you to Shiksha.cloud billing", {
            description: `Call ${CONTACT_PHONE} for wallet top-up, plan change, or invoice help.`,
            duration: 8000,
        });
        window.location.href = `tel:${CONTACT_PHONE}`;
    };

    const requestPlanChange = () => {
        if (!selectedPlan) return;

        toast.success("Plan change request submitted", {
            description: `${selectedPlan.name} on ${billingCycle.toLowerCase()} billing — processing will begin shortly.`,
            duration: 5000,
        });
        setActiveDialog(null);
    };

    const requestTopUp = () => {
        toast.success("Top-up initiated", {
            description: `${formatCurrencyINWithSymbol(selectedTopUp)} credits will be added to your wallet.`,
            duration: 5000,
        });
        setActiveDialog(null);
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
                    {subscription ? (() => {
                        const activePlan = plans.find(p => p.code === subscription.planCode);
                        const price = billingCycle === "ANNUAL"
                            ? (activePlan?.annualPrice ?? 0)
                            : (activePlan?.monthlyPrice ?? 0);
                        return (
                            <>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant={STATUS_VARIANTS[subscription.status] ?? "secondary"}>
                                        {formatBillingStatus(subscription.status)}
                                    </Badge>
                                    {subscription.offerName ? <Badge variant="secondary">{subscription.offerName}</Badge> : null}
                                    <Badge variant={subscription.billingCycle === "ANNUAL" ? "premium" : "secondary"}>
                                        {subscription.billingCycle === "ANNUAL" ? "20% off" : "Billed monthly"}
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
                                        {formatCurrencyINWithSymbol(price)}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        /{billingCycle === "ANNUAL" ? "year" : "month"}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                                    <span className="text-muted-foreground">Up to <strong>{subscription.studentLimit?.toLocaleString("en-IN") ?? "—"}</strong> students</span>
                                    <span className="text-muted-foreground">
                                        Next invoice: <strong>{formatCurrencyINWithSymbol(subscription.nextInvoiceAmount)}</strong>
                                    </span>
                                    <span className="text-muted-foreground">
                                        Due <strong>{nextBillingDate ? formatDateIN(nextBillingDate) : "—"}</strong>
                                    </span>
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <GraduationCap className="h-4 w-4" />
                                        <span>{studentCount.toLocaleString("en-IN")} / {subscription.studentLimit?.toLocaleString("en-IN") ?? "—"} students</span>
                                    </div>
                                    <span className="text-sm font-medium tabular-nums">{usagePercent}%</span>
                                </div>
                                <Progress value={usagePercent} className="h-1.5" />
                            </>
                        );
                    })() : (
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

                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-medium">Auto recharge</p>
                            <p className="text-xs text-muted-foreground">Trigger when wallet falls below ₹20.</p>
                        </div>
                        <Switch
                            checked={autoRecharge}
                            onCheckedChange={(checked) => {
                                setAutoRecharge(checked);
                                toast.success(checked ? "Auto recharge enabled" : "Auto recharge disabled", {
                                    description: checked
                                        ? "Wallet will auto-recharge when balance falls below the threshold."
                                        : "Manual top-up will be required when wallet runs low.",
                                    duration: 5000,
                                });
                            }}
                            aria-label="Toggle auto recharge"
                        />
                    </div>

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
                                                    <Badge variant={invoice.status === "PAID" ? "secondary" : "outline"}>
                                                        {formatBillingStatus(invoice.status)}
                                                    </Badge>
                                                </td>
                                                <td className="py-2.5 text-right text-sm tabular-nums font-medium">
                                                    {formatCurrencyINWithSymbol(invoice.total)}
                                                </td>
                                                <td className="py-2.5 text-right">
                                                    <Button variant="ghost" size="sm" onClick={() =>
                                                        toast.info("PDF download", {
                                                            description: "Invoice PDF generation will be available once the template engine is finalized.",
                                                            duration: 5000,
                                                        })
                                                    }>
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
                                            <Badge variant={payment.status === "SUCCESS" ? "secondary" : "outline"}>
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
                                <Button variant="outline" className="justify-start gap-2" onClick={openPhone}>
                                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-left">Contact billing</span>
                                </Button>
                            </div>

                            <Separator className="my-1" />

                            {subscription ? (
                                <div className="flex flex-col gap-3">
                                    <h4 className="text-sm font-medium">Subscription timeline</h4>
                                    <div className="flex flex-col gap-2">
                                        <TimelineItem
                                            title="Trial started"
                                            description={subscription.trialEndsAt
                                                ? `Started on ${formatDateIN(subscription.trialEndsAt)}`
                                                : "Trial period is active."}
                                            status="done"
                                        />
                                        <TimelineItem
                                            title="Current period"
                                            description={subscription.currentPeriodEnd
                                                ? `Ends on ${formatDateIN(subscription.currentPeriodEnd)}`
                                                : "No end date set."}
                                            status="current"
                                        />
                                        <TimelineItem
                                            title="Renewal"
                                            description={subscription.status === "TRIALING"
                                                ? "Plan will activate after trial ends."
                                                : "Auto-renews at end of billing period."}
                                            status="pending"
                                        />
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
                                    <span className="font-medium">{subscription?.planName ?? "&mdash;"}</span>
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
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Upgrade plan</DialogTitle>
                        <DialogDescription>
                            Select a plan and billing cycle for your organization.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
                            <div>
                                <p className="text-sm font-medium">Billing cycle</p>
                                <p className="text-xs text-muted-foreground">Choose monthly or annual billing.</p>
                            </div>
                            <div className="flex rounded-md border bg-background p-1">
                                {(["MONTHLY", "ANNUAL"] as const).map((cycle) => (
                                    <Button
                                        key={cycle}
                                        variant={billingCycle === cycle ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => setBillingCycle(cycle)}
                                    >
                                        {cycle === "MONTHLY" ? "Monthly" : "Annual"}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                            {plans.map((plan) => {
                                const isSelected = plan.code === selectedPlanCode;
                                const isCurrent = plan.code === subscription?.planCode;
                                const price = billingCycle === "ANNUAL" ? plan.annualPrice : plan.monthlyPrice;

                                return (
                                    <button
                                        key={plan.code}
                                        type="button"
                                        className={cn(
                                            "flex min-h-[13rem] flex-col justify-between rounded-lg border bg-background p-4 text-left transition hover:border-primary/50",
                                            isSelected && "border-primary ring-1 ring-primary"
                                        )}
                                        onClick={() => setSelectedPlanCode(plan.code)}
                                    >
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="font-semibold">{plan.name}</p>
                                                {isCurrent ? <Badge variant="verified">Current</Badge> : null}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{plan.description}</p>
                                        </div>
                                        <div className="mt-4">
                                            <p className="text-2xl font-semibold tabular-nums">{formatCurrencyINWithSymbol(price)}</p>
                                            <p className="text-xs text-muted-foreground">
                                                per {billingCycle === "ANNUAL" ? "year" : "month"} up to{" "}
                                                {plan.studentLimit.toLocaleString("en-IN")} students
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {selectedPlan ? (
                            <div className="rounded-lg border bg-muted/30 p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm font-medium">Preview invoice</p>
                                        <p className="text-xs text-muted-foreground">
                                            {selectedPlan.name} on {billingCycle.toLowerCase()} billing.
                                        </p>
                                    </div>
                                    <p className="text-2xl font-semibold tabular-nums">{formatCurrencyINWithSymbol(planPrice)}</p>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActiveDialog(null)}>
                            Cancel
                        </Button>
                        <Button variant="default" disabled={!hasPendingPlanChange} onClick={requestPlanChange}>
                            Request change
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={activeDialog === "top-up"} onOpenChange={(open) => setActiveDialog(open ? "top-up" : null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Top-up wallet</DialogTitle>
                        <DialogDescription>
                            Choose an amount to add notification credits to your wallet.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-2">
                            {topUpAmounts.map((amount) => (
                                <button
                                    key={amount}
                                    type="button"
                                    className={cn(
                                        "rounded-lg border bg-background p-4 text-left transition hover:border-primary/50",
                                        selectedTopUp === amount && "border-primary ring-1 ring-primary"
                                    )}
                                    onClick={() => setSelectedTopUp(amount)}
                                >
                                    <p className="text-lg font-semibold tabular-nums">{formatCurrencyINWithSymbol(amount)}</p>
                                    <p className="text-xs text-muted-foreground">Notification credits</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={openPhone}>
                            <PhoneIcon />
                            Call billing
                        </Button>
                        <Button variant="default" onClick={requestTopUp}>
                            <Wallet className="h-4 w-4" />
                            Add credits
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={activeDialog === "invoice"} onOpenChange={(open) => setActiveDialog(open ? "invoice" : null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invoice center</DialogTitle>
                        <DialogDescription>
                            Review and manage your organization&apos;s invoices.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-3">
                        <TimelineItem title="Sequential receipt numbering" description="Automated numbering is configured." status="done" />
                        <TimelineItem title="PDF invoice export" description="Invoice PDF generation is in progress." status="current" />
                        <TimelineItem title="Payment reconciliation" description="Automated reconciliation via payment gateway callbacks." status="current" />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActiveDialog(null)}>
                            Close
                        </Button>
                        <Button variant="default" onClick={openPhone}>
                            <MessageCircle className="h-4 w-4" />
                            Contact billing
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function PhoneIcon() {
    return <Phone className="h-4 w-4" />;
}
