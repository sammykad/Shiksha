"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, WalletCards, Landmark, CreditCard, Smartphone, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { updateTeacherPayoutAction } from "@/app/actions"

const payoutSchema = z
  .object({
    accountHolderName: z.string().min(2, "Account holder name is required"),
    bankName: z.string().min(2, "Bank name is required"),
    accountNumber: z
      .string()
      .min(9, "Account number must be at least 9 digits")
      .max(18, "Account number seems too long")
      .regex(/^\d+$/, "Account number must contain only digits"),
    confirmAccountNumber: z.string(),
    ifscCode: z
      .string()
      .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code (e.g., HDFC0001234)"),
    upiId: z
      .string()
      .regex(/^[\w.\-]+@[\w]+$/, "Enter a valid UPI ID (e.g., name@bank)")
      .optional()
      .or(z.literal("")),
    panNumber: z
      .string()
      .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Enter a valid PAN (e.g., ABCDE1234F)")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => data.accountNumber === data.confirmAccountNumber, {
    message: "Account numbers do not match",
    path: ["confirmAccountNumber"],
  })

type PayoutFormData = z.infer<typeof payoutSchema>

export function TeacherPayoutForm() {
  const [saving, setSaving] = useState(false)

  const form = useForm<PayoutFormData>({
    resolver: zodResolver(payoutSchema),
    defaultValues: {
      accountHolderName: "",
      bankName: "",
      accountNumber: "",
      confirmAccountNumber: "",
      ifscCode: "",
      upiId: "",
      panNumber: "",
    },
  })

  async function onSubmit(data: PayoutFormData) {
    setSaving(true)
    try {
      const result = await updateTeacherPayoutAction({
        accountHolderName: data.accountHolderName,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        ifscCode: data.ifscCode,
        upiId: data.upiId || null,
        panNumber: data.panNumber || null,
      })

      if (!result.success) {
        throw new Error(result.error || "Failed to save payout information")
      }

      toast.success("Payout information saved successfully")
      form.reset(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save payout information")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <WalletCards className="h-5 w-5 text-primary" />
          Salary & Payout Information
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your bank account details and payout preferences for salary disbursement.
        </p>
      </div>

      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Landmark className="h-4 w-4 text-muted-foreground" />
                Bank Account Details
              </CardTitle>
              <CardDescription>
                Provide your bank account information for salary transfers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="accountHolderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Holder Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input placeholder="State Bank of India" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter account number" type="password" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Protected for your security
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmAccountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Account Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Re-enter account number" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="ifscCode"
                render={({ field }) => (
                  <FormItem className="sm:max-w-xs">
                    <FormLabel>IFSC Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="HDFC0001234"
                        className="uppercase"
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        value={field.value}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        name={field.name}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      11-character code found on your cheque or passbook
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                Additional Payment Methods
              </CardTitle>
              <CardDescription>Optional payment methods for faster disbursement.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="upiId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                        UPI ID
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="teacher@bank" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        e.g., name@okhdfcbank, name@paytm
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="panNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                        PAN Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ABCDE1234F"
                          className="uppercase"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          value={field.value}
                          onBlur={field.onBlur}
                          ref={field.ref}
                          name={field.name}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Required for TDS and tax reporting
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3 pt-2 border-t">
            <Button type="submit" disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving ? "Saving..." : "Save Payout Information"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => form.reset()}
              disabled={saving}
            >
              Reset
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
