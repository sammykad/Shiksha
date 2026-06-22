"use client";

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, WalletCards, Landmark, Smartphone, ShieldCheck, ChevronRight, Eye, EyeOff } from 'lucide-react';
import banks from '@/public/bank/banks.json';
import { z } from 'zod';
import { updateTeacherPayoutAction } from '@/lib/data/payout/save-own-payout';

const payoutSchema = z
  .object({
    ifscCode: z
      .string()
      .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Enter a valid IFSC code (e.g., HDFC0001234)'),
    bankName: z.string().min(2, 'Bank name is required'),
    branchName: z.string().optional().or(z.literal('')),
    accountHolderName: z.string().min(2, 'Account holder name is required'),
    accountNumber: z
      .string()
      .min(9, 'Account number must be at least 9 digits')
      .max(18, 'Account number seems too long')
      .regex(/^\d+$/, 'Account number must contain only digits'),
    confirmAccountNumber: z.string(),
    upiId: z
      .string()
      .regex(/^[\w.\-]+@[\w]+$/, 'Enter a valid UPI ID (e.g., name@bank)')
      .optional()
      .or(z.literal('')),
    panNumber: z
      .string()
      .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Enter a valid PAN (e.g., ABCDE1234F)')
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => data.accountNumber === data.confirmAccountNumber, {
    message: 'Account numbers do not match',
    path: ['confirmAccountNumber'],
  });

type PayoutFormData = z.infer<typeof payoutSchema>;

export function TeacherPayoutForm({ defaultName, initialBank }: { defaultName?: string; initialBank?: {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string | null;
  upiId: string | null;
  panNumber: string | null;
} | null }) {
  const [saving, setSaving] = useState(false);
  const [isLookingUpIfsc, setIsLookingUpIfsc] = useState(false);
  const [bankCode, setBankCode] = useState<string | null>(null);
  const [bankAddress, setBankAddress] = useState<string | null>(null);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const ifscTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const form = useForm<PayoutFormData>({
    resolver: zodResolver(payoutSchema),
    defaultValues: {
      ifscCode: initialBank?.ifscCode || '',
      bankName: initialBank?.bankName || '',
      branchName: initialBank?.branchName || '',
      accountHolderName: initialBank?.accountHolderName || defaultName?.toUpperCase() || '',
      accountNumber: initialBank?.accountNumber || '',
      confirmAccountNumber: initialBank?.accountNumber || '',
      upiId: initialBank?.upiId || '',
      panNumber: initialBank?.panNumber || '',
    },
  });

  const lookupIfscDetails = useCallback(async (ifsc: string) => {
    if (ifsc.length !== 11 || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) return;
    setIsLookingUpIfsc(true);
    setBankCode(null);
    setBankAddress(null);
    try {
      const res = await fetch(`https://ifsc.razorpay.com/${ifsc}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();

      const bankKey = data.BANKCODE?.toLowerCase();
      if (bankKey && bankKey in banks) {
        form.setValue('bankName', banks[bankKey as keyof typeof banks]);
        setBankCode(bankKey);
      } else if (data.BANK) {
        form.setValue('bankName', data.BANK);
      }
      if (data.BRANCH) form.setValue('branchName', data.BRANCH);
      if (data.ADDRESS) setBankAddress(data.ADDRESS);
    } catch {
      toast.error('IFSC code not found. Please check and try again.');
    } finally {
      setIsLookingUpIfsc(false);
    }
  }, [form]);

  useEffect(() => {
    if (initialBank?.bankName) {
      const key = Object.entries(banks).find(([, name]) => name === initialBank.bankName)?.[0];
      if (key) setBankCode(key);
    }
  }, [initialBank?.bankName]);

  const watchedIfsc = form.watch('ifscCode');

  useEffect(() => {
    if (ifscTimerRef.current) clearTimeout(ifscTimerRef.current);
    if (!watchedIfsc || watchedIfsc.length !== 11 || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(watchedIfsc)) return;

    ifscTimerRef.current = setTimeout(() => {
      lookupIfscDetails(watchedIfsc);
    }, 500);

    return () => {
      if (ifscTimerRef.current) clearTimeout(ifscTimerRef.current);
    };
  }, [watchedIfsc, lookupIfscDetails]);

  async function onSubmit(data: PayoutFormData) {
    setSaving(true);
    try {
      const result = await updateTeacherPayoutAction({
        accountHolderName: data.accountHolderName,
        bankName: data.bankName,
        branchName: data.branchName || null,
        accountNumber: data.accountNumber,
        ifscCode: data.ifscCode,
        upiId: data.upiId || null,
        panNumber: data.panNumber || null,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to save payout information');
      }

      toast.success('Payout information saved successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save payout information');
    } finally {
      setSaving(false);
    }
  }

  const bankName = form.watch('bankName');
  const branchName = form.watch('branchName');
  const ifscCode = form.watch('ifscCode');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <WalletCards className="h-5 w-5 text-primary" />
          Salary & Payout Information
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your IFSC code first — we&apos;ll auto-fill the bank details for you.
        </p>
      </div>

      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* IFSC + Bank Info side by side */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="p-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: IFSC input */}
                  <FormField
                    control={form.control}
                    name="ifscCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          IFSC Code <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="SBIN0001234"
                              maxLength={11}
                              className="font-mono uppercase h-11 pr-8 tracking-wider"
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                              value={field.value}
                              ref={field.ref}
                              name={field.name}
                              onBlur={field.onBlur}
                            />
                            {isLookingUpIfsc && (
                              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs">
                          11-character code — first 4 letters identify the bank
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Right: Bank details card */}
                  <div className="flex flex-col justify-end">
                    <FormLabel className="mb-2 block">
                      Bank Details
                    </FormLabel>
                    {bankName ? (
                      <div className="rounded-lg border bg-card h-full">
                        <div className="flex items-start gap-4 p-4">
                          <div className="h-12 w-12 rounded-lg border bg-white p-1.5 flex items-center justify-center shrink-0 shadow-sm">
                            {bankCode ? (
                              <img
                                src={`/bank/${bankCode}/symbol.svg`}
                                className="h-full w-full object-contain"
                                alt={bankName}
                              />
                            ) : (
                              <Landmark className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">{bankName}</p>
                            {branchName && (
                              <p className="text-xs text-muted-foreground mt-0.5">{branchName}</p>
                            )}
                          </div>
                        </div>
                        <div className="border-t px-4 py-3 space-y-1">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground/70">IFSC Code:</span> {ifscCode}
                          </p>
                          {bankAddress && (
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium text-foreground/70">Address:</span> {bankAddress}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : isLookingUpIfsc ? (
                      <div className="rounded-lg border border-dashed bg-muted/30 p-4 flex items-center gap-3 text-sm text-muted-foreground h-full">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Looking up IFSC details...
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed bg-muted/20 p-4 flex items-center justify-center text-xs text-muted-foreground h-full">
                        Bank info appears here after IFSC lookup
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Account holder */}
            <div className="rounded-xl border bg-card shadow-sm p-5 space-y-5">
              <FormField
                control={form.control}
                name="accountHolderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Name on account <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Exactly as on bank account" className="h-11 uppercase" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Account number <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showAccountNumber ? 'text' : 'password'}
                            placeholder="Enter account number"
                            className="h-11 font-mono pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowAccountNumber((v) => !v)}
                            tabIndex={-1}
                          >
                            {showAccountNumber ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">Protected for security</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmAccountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Confirm account <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Re-enter account number"
                          className="h-11 font-mono"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional options */}
            <div className="rounded-xl border bg-card shadow-sm p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                        <Input {...field} placeholder="teacher@bank" className="h-11" />
                      </FormControl>
                      <FormDescription className="text-xs">
                        e.g., name@okhdfcbank
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
                          {...field}
                          placeholder="ABCDE1234F"
                          className="uppercase font-mono h-11"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          value={field.value}
                          onBlur={field.onBlur}
                          ref={field.ref}
                          name={field.name}
                          readOnly={false}
                        />
                      </FormControl>
                      <FormDescription>
                        Required for TDS reporting
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <p className="text-[11px] text-muted-foreground">
                Your details are encrypted and secure
              </p>
              <div className="flex gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    form.reset();
                    setBankCode(null);
                    setBankAddress(null);
                  }}
                  disabled={saving}
                >
                  Reset
                </Button>
                <Button type="submit" size="sm" disabled={saving} className="gap-1.5">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
                  {saving ? 'Saving...' : 'Save Payout Information'}
                </Button>
              </div>
            </div>
        </form>
      </Form>
    </div>
  );
}
