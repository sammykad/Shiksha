"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle, ChevronRight, CreditCard, ArrowLeft } from "lucide-react";
import { formatCurrencyINWithSymbol } from "@/lib/utils";

type PlanOption = {
  code: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  studentLimit: number;
  description: string;
};

type CheckoutStep = "select-plan" | "confirm" | "payment" | "success";

interface CheckoutFlowProps {
  currentPlanCode?: string;
  currentBillingCycle?: string;
  studentCount: number;
  plans: PlanOption[];
  onComplete?: () => void;
  onClose?: () => void;
}

export function CheckoutFlow({
  currentPlanCode,
  currentBillingCycle,
  studentCount,
  plans,
  onComplete,
  onClose,
}: CheckoutFlowProps) {
  const [step, setStep] = useState<CheckoutStep>("select-plan");
  const [selectedPlan, setSelectedPlan] = useState<PlanOption | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    (currentBillingCycle as "monthly" | "annual") ?? "monthly"
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const currentPlan = plans.find((p) => p.code === currentPlanCode);
  const price = selectedPlan
    ? billingCycle === "annual"
      ? selectedPlan.annualPrice
      : selectedPlan.monthlyPrice
    : 0;

  const handleContinue = () => {
    if (!selectedPlan) return;
    if (step === "select-plan") setStep("confirm");
    else if (step === "confirm") {
      setStep("payment");
      // Placeholder: simulate payment processing
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setStep("success");
      }, 2000);
    }
  };

  const handleBack = () => {
    if (step === "confirm") setStep("select-plan");
    else if (step === "payment") setStep("confirm");
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      {/* Step indicator */}
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle>
            {step === "select-plan" && "Choose a Plan"}
            {step === "confirm" && "Confirm Your Plan"}
            {step === "payment" && "Complete Payment"}
            {step === "success" && "Plan Updated!"}
          </CardTitle>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={step === "select-plan" ? "text-primary font-medium" : ""}>Plan</span>
            <ChevronRight className="h-3 w-3" />
            <span className={step === "confirm" ? "text-primary font-medium" : ""}>Review</span>
            <ChevronRight className="h-3 w-3" />
            <span className={step === "payment" ? "text-primary font-medium" : ""}>Pay</span>
            <ChevronRight className="h-3 w-3" />
            <span className={step === "success" ? "text-primary font-medium" : ""}>Done</span>
          </div>
          <CardDescription>
            {step === "select-plan" && "Select a plan that fits your institution's needs."}
            {step === "confirm" && "Review your selection before proceeding."}
            {step === "payment" && "Complete payment to activate your plan."}
            {step === "success" && "Your plan has been updated successfully."}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ── Step 1: Select Plan ─────────────────────────────────────────── */}
        {step === "select-plan" && (
          <>
            {/* Billing Cycle Toggle */}
            <div className="flex items-center justify-center gap-2">
              <Button
                variant={billingCycle === "monthly" ? "default" : "outline"}
                size="sm"
                onClick={() => setBillingCycle("monthly")}
              >
                Monthly
              </Button>
              <Button
                variant={billingCycle === "annual" ? "default" : "outline"}
                size="sm"
                onClick={() => setBillingCycle("annual")}
              >
                Annual <span className="ml-1 text-xs text-green-500">Save 20%</span>
              </Button>
            </div>

            {/* Plan Cards */}
            <div className="grid gap-3">
              {plans.map((plan) => {
                const isCurrent = plan.code === currentPlanCode;
                const isSelected = selectedPlan?.code === plan.code;
                const planPrice = billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;

                return (
                  <button
                    key={plan.code}
                    type="button"
                    onClick={() => setSelectedPlan(plan)}
                    className={`relative flex items-start gap-4 rounded-lg border p-4 text-left transition-all hover:border-primary/50 ${
                      isSelected ? "border-primary ring-1 ring-primary" : ""
                    }`}
                  >
                    <div className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 ${
                      isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                    }`}>
                      {isSelected && <div className="h-2 w-2 rounded-full bg-white m-0.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{plan.name}</span>
                        {isCurrent && <Badge variant="outline" className="text-[10px]">Current</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {plan.description}
                      </p>
                      <div className="flex items-baseline gap-1.5 mt-2">
                        <span className="text-xl font-bold tabular-nums">
                          {formatCurrencyINWithSymbol(planPrice)}
                        </span>
                        <span className="text-xs text-muted-foreground">/{billingCycle === "annual" ? "year" : "month"}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Up to {plan.studentLimit.toLocaleString("en-IN")} students
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action */}
            <Button
              className="w-full"
              disabled={!selectedPlan || selectedPlan.code === currentPlanCode}
              onClick={handleContinue}
            >
              {selectedPlan?.code === currentPlanCode
                ? "Already on this plan"
                : `Continue with ${selectedPlan?.name ?? ""}`}
            </Button>
          </>
        )}

        {/* ── Step 2: Confirm ─────────────────────────────────────────────── */}
        {step === "confirm" && selectedPlan && (
          <>
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">{selectedPlan.name}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Billing Cycle</span>
                <span className="font-medium capitalize">{billingCycle}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Student Limit</span>
                <span className="font-medium">{selectedPlan.studentLimit.toLocaleString("en-IN")}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Students</span>
                <span className="font-medium">{studentCount}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrencyINWithSymbol(price)}/{billingCycle === "annual" ? "yr" : "mo"}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button onClick={handleContinue} className="flex-1">
                Proceed to Payment <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </>
        )}

        {/* ── Step 3: Payment Gateway Placeholder ─────────────────────────── */}
        {step === "payment" && selectedPlan && (
          <>
            <div className="rounded-lg border bg-muted/30 p-6 text-center space-y-4">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="font-medium">Payment Gateway</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Payment provider integration is not yet configured.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  You will be redirected to complete payment via your chosen provider.
                </p>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Amount: </span>
                <span className="font-semibold">{formatCurrencyINWithSymbol(price)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack} disabled={isProcessing} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button onClick={handleContinue} disabled={isProcessing} className="flex-1">
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Simulate Payment"
                )}
              </Button>
            </div>

            {/* Provider selection placeholder */}
            <div className="rounded-lg border border-dashed p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">Payment Providers (Pluggable)</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">PhonePe</Badge>
                <Badge variant="secondary" className="text-xs">Razorpay</Badge>
                <Badge variant="secondary" className="text-xs">Stripe</Badge>
                <Badge variant="secondary" className="text-xs">PayPal</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Once provider is selected, `createSubscriptionPayment()` + `activateSubscription()` will be called on success callback.
              </p>
            </div>
          </>
        )}

        {/* ── Step 4: Success ─────────────────────────────────────────────── */}
        {step === "success" && selectedPlan && (
          <div className="text-center space-y-4 py-6">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
            <div>
              <p className="text-lg font-semibold">Plan Updated Successfully</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your institution is now on the <span className="font-medium">{selectedPlan.name}</span> plan.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Billing cycle: {billingCycle === "annual" ? "Annual" : "Monthly"}
              </p>
            </div>
            <Separator />
            <div className="rounded-lg bg-muted/30 p-3 text-sm">
              <p className="text-muted-foreground">Next steps:</p>
              <ul className="mt-2 space-y-1 text-xs text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Invoice generated and ready for payment
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Subscription status updated in dashboard
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Student limit adjusted to {selectedPlan.studentLimit.toLocaleString("en-IN")}
                </li>
              </ul>
            </div>
            <Button onClick={onComplete} className="w-full">
              Back to Settings
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
