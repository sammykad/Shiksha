'use client';

// components/fees/RecordPdcPaymentCard.tsx

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { recordPdcPayment } from '@/lib/data/fee/recordPdcPayment';
import {
    pdcPaymentSchema,
    PdcPaymentFormData,
} from '@/lib/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { InfoIcon, AlertCircleIcon, CheckCircle2Icon, CalendarIcon, WalletIcon, Loader2 } from 'lucide-react';
import { cn, formatCurrencyIN } from '@/lib/utils';
import banks from '@/public/bank/banks.json';
import { FeeRecord } from '@/types';
import { getInFlightPdcAmount } from '@/lib/data/fee/fee-balance-utils';

// ── Types ────────────────────────────────────────────────────────────────────

interface RecordPdcPaymentCardProps {
    selectedRecord: FeeRecord;
    onSuccess: () => void;
}

// ── Pre-entry checklist ───────────────────────────────────────────────────────
const CHECKLIST_ITEMS = [
    { id: 'signed', label: 'Cheque is signed by the account holder' },
    { id: 'date', label: 'Date on the cheque matches the cheque date entered above' },
    { id: 'amount', label: 'Amount in words and figures match on the cheque' },
    { id: 'name', label: 'Payee name is written correctly — no overwriting or correction' },
    { id: 'clean', label: 'No whitener, scribble, or post-correction on the cheque' },
] as const;

type ChecklistId = (typeof CHECKLIST_ITEMS)[number]['id'];

// ── Field group label ─────────────────────────────────────────────────────────
function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2.5">
            <p className="text-[10.5px] font-semibold uppercase tracking-widest text-muted-foreground">
                {label}
            </p>
            {children}
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────
export function RecordPdcPaymentCard({ selectedRecord, onSuccess }: RecordPdcPaymentCardProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checklist, setChecklist] = useState<Record<ChecklistId, boolean>>({
        signed: false,
        date: false,
        amount: false,
        name: false,
        clean: false,
    });

    const allChecked = Object.values(checklist).every(Boolean);

    const pending = Number(selectedRecord.fee.pendingAmount || 0);
    const totalInFlightPdc = getInFlightPdcAmount(selectedRecord.payments);
    const maxAllowable = Math.max(pending - totalInFlightPdc, 0);

    const form = useForm<PdcPaymentFormData>({
        resolver: zodResolver(pdcPaymentSchema),
        defaultValues: {
            feeId: selectedRecord.fee.id,
            payerId: selectedRecord.student.userId,
            amount: maxAllowable,
            chequeNumber: '',
            chequeDate: undefined,
            bankName: '',
            branchName: '',
            ifscCode: '',
            micrCode: '',
            accountHolderName: `${selectedRecord.student.firstName} ${selectedRecord.student.lastName}`,
            accountNumberLast4: '',
            remarks: '',
        },
    });

    // ── IFSC auto-fill via Razorpay IFSC API ────────────────────────────────
    const [isLookingUpIfsc, setIsLookingUpIfsc] = useState(false);
    const ifscTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

    const lookupIfscDetails = useCallback(async (ifsc: string) => {
        if (ifsc.length !== 11 || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) return;
        setIsLookingUpIfsc(true);
        try {
            const res = await fetch(`https://ifsc.razorpay.com/${ifsc}`);
            if (!res.ok) throw new Error('Not found');
            const data = await res.json();

            const bankKey = data.BANKCODE?.toLowerCase();
            if (bankKey && bankKey in banks) {
                form.setValue('bankName', banks[bankKey as keyof typeof banks]);
            } else if (Object.values(banks).includes(data.BANK)) {
                form.setValue('bankName', data.BANK);
            }
            form.setValue('branchName', data.BRANCH);
            if (data.MICR) form.setValue('micrCode', data.MICR);
        } catch {
            // silent — user can still enter manually
        } finally {
            setIsLookingUpIfsc(false);
        }
    }, [form]);

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

    const onSubmit = async (data: PdcPaymentFormData) => {
        if (!allChecked) {
            toast.error('Complete the physical cheque verification before recording');
            return;
        }
        setIsSubmitting(true);
        try {
            const result = await recordPdcPayment(data);
            toast.success(result.message, { description: `Receipt: ${result.receiptNumber}` });
            onSuccess();
        } catch (err) {
            const errorMessage = (err as Error).message ?? 'Failed to record PDC cheque';

            if (errorMessage.includes('already has pending cheques')) {
                toast.warning('Pending Payment Conflict', {
                    description: errorMessage,
                });
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleCheck = (id: ChecklistId) =>
        setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>

                {/* ── Scrollable body ───────────────────────────────────────────── */}
                <div className="max-h-[62vh] overflow-y-auto space-y-5 px-1.5 pb-2">

                    {/* Info banner */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50/50 px-3.5 py-2.5 dark:border-blue-800/50 dark:bg-blue-950/30">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                                <InfoIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-[12px] font-medium leading-none text-blue-700 dark:text-blue-300">
                                Fee remains <Badge variant="UNPAID" className="h-4 px-1 text-[9px] uppercase mx-1 font-bold">Unpaid</Badge> until the cheque clears.
                            </div>
                        </div>

                        {totalInFlightPdc > 0 && (
                            <Alert variant="warning" className="bg-amber-50 border-amber-200 py-3">
                                <WalletIcon className="h-4 w-4 text-amber-600" />
                                <AlertDescription className="text-[11px] text-amber-800 font-medium leading-normal ml-2">
                                    This fee already has <span className="font-bold">₹{formatCurrencyIN(totalInFlightPdc)}</span> in pending cheques.
                                    {maxAllowable <= 0 ? (
                                        <span className="block mt-1">The entire balance is already covered by pending cheques.</span>
                                    ) : (
                                        <span className="block mt-1">Remaining allowable balance to record is ₹{formatCurrencyIN(maxAllowable)}.</span>
                                    )}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    {/* Student + fee strip */}
                    <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3.5 py-2.5">
                        <div>
                            <p className="text-sm font-medium leading-none">
                                {selectedRecord.student.firstName} {selectedRecord.student.lastName}
                            </p>
                            {selectedRecord.feeCategory?.name && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {selectedRecord.feeCategory.name}
                                </p>
                            )}
                        </div>
                        <Badge variant="UNPAID" className="tabular-nums font-semibold">
                            ₹{pending.toLocaleString('en-IN')} pending
                        </Badge>
                    </div>

                    {/* Cheque details — Improved layout for spacing */}
                    <FieldGroup label="Cheque details">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="chequeNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Cheque no. <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="004521"
                                                maxLength={6}
                                                inputMode="numeric"
                                                className="font-mono h-10"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="chequeDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>
                                            Cheque date <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className={cn(
                                                            'w-full pl-3 text-left font-normal border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-12',
                                                            !field.value && 'text-muted-foreground'
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            new Intl.DateTimeFormat('en-IN', {
                                                                dateStyle: 'long',
                                                            }).format(new Date(field.value))
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                    autoFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>
                                            Amount <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                                                    ₹
                                                </span>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    min={1}
                                                    max={maxAllowable}
                                                    step="0.01"
                                                    className="pl-7 tabular-nums h-10 text-lg font-semibold"
                                                    placeholder="0"
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                />
                                                <div className="absolute inset-y-0 right-3 flex items-center">
                                                    <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                                        Max ₹{formatCurrencyIN(maxAllowable)}
                                                    </span>
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </FieldGroup>

                    {/* Bank details — IFSC first, then auto-fills bank + branch + MICR below */}
                    <FieldGroup label="Bank">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="ifscCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>IFSC code</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    {...field}
                                                    placeholder="SBIN0001234"
                                                    maxLength={11}
                                                    className="font-mono uppercase h-10 pr-8"
                                                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                                />
                                                {isLookingUpIfsc && (
                                                    <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="micrCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>MICR code</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="9-digit MICR"
                                                maxLength={9}
                                                className="font-mono h-10"
                                                inputMode="numeric"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <FormField
                                control={form.control}
                                name="bankName"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>
                                            Bank name <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-10">
                                                    <SelectValue placeholder="Select bank">
                                                        {field.value ? (
                                                            <div className="flex items-center gap-2">
                                                                {(() => {
                                                                    const entry = Object.entries(banks).find(([_, v]) => v === field.value);
                                                                    return entry ? (
                                                                        <img
                                                                            src={`/bank/${entry[0]}/symbol.svg`}
                                                                            className="h-5 w-5 object-contain"
                                                                            alt=""
                                                                        />
                                                                    ) : null;
                                                                })()}
                                                                <span>{field.value}</span>
                                                            </div>
                                                        ) : (
                                                            "Select bank"
                                                        )}
                                                    </SelectValue>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="max-h-[300px]">
                                                {Object.entries(banks).map(([code, name]) => (
                                                    <SelectItem key={code} value={name}>
                                                        <div className="flex items-center gap-3 py-1">
                                                            <div className="h-7 w-7 rounded-md border border-slate-100 bg-white p-1 flex items-center justify-center shrink-0">
                                                                <img
                                                                    src={`/bank/${code}/symbol.svg`}
                                                                    className="h-full w-full object-contain"
                                                                    alt={name}
                                                                />
                                                            </div>
                                                            <span className="text-xs font-medium">{name}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="branchName"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Branch name <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="e.g. Pimple Saudagar" className="h-10" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </FieldGroup>

                    {/* Account holder — name full, last4 half */}
                    <FieldGroup label="Account holder">
                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="accountHolderName"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>
                                            Name on cheque <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Exactly as printed on cheque" className="h-10" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="accountNumberLast4"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last 4 digits</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="XXXX"
                                                maxLength={4}
                                                className="font-mono h-10"
                                                inputMode="numeric"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </FieldGroup>

                    {/* Remarks */}
                    <FormField
                        control={form.control}
                        name="remarks"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Remarks</FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        placeholder="Any additional notes about this cheque..."
                                        className="resize-none h-14 text-sm"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* ── Pre-entry verification checklist ───────────────────────── */}
                    <div
                        className={cn(
                            'rounded-md border p-4 space-y-3 transition-colors duration-200',
                            allChecked
                                ? 'border-green-200 bg-green-50/70 dark:border-green-800 dark:bg-green-950/20'
                                : 'border-amber-200 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/20'
                        )}
                    >
                        {/* Checklist header */}
                        <div className="flex items-center gap-2">
                            {allChecked ? (
                                <CheckCircle2Icon className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                            ) : (
                                <AlertCircleIcon className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                            )}
                            <p
                                className={cn(
                                    'text-xs font-semibold',
                                    allChecked
                                        ? 'text-green-700 dark:text-green-400'
                                        : 'text-amber-700 dark:text-amber-400'
                                )}
                            >
                                Physical cheque verification — check before recording
                            </p>
                        </div>

                        {/* Checklist items */}
                        <ul className="space-y-2">
                            {CHECKLIST_ITEMS.map((item) => (
                                <li key={item.id}>
                                    <label className="flex cursor-pointer items-start gap-2.5">
                                        <Checkbox
                                            checked={checklist[item.id]}
                                            onCheckedChange={() => toggleCheck(item.id)}
                                            className="mt-0.5 shrink-0"
                                        />
                                        <span
                                            className={cn(
                                                'text-xs leading-relaxed transition-colors',
                                                checklist[item.id]
                                                    ? 'text-muted-foreground/60 line-through'
                                                    : 'text-foreground'
                                            )}
                                        >
                                            {item.label}
                                        </span>
                                    </label>
                                </li>
                            ))}
                        </ul>

                        {!allChecked && (
                            <p className="text-[10px] text-amber-600 dark:text-amber-500">
                                All items must be confirmed before you can record this cheque.
                            </p>
                        )}
                    </div>
                </div>

                {/* ── Sticky footer — outside scroll ────────────────────────────── */}
                <div className="flex items-center justify-between gap-3 border-t pt-4 mt-1">
                    <p className="text-[11px] text-muted-foreground">
                        Fee stays{' '}
                        <span className="font-medium text-foreground">Unpaid</span>{' '}
                        until cheque is cleared by admin
                    </p>
                    <div className="flex gap-2 shrink-0">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onSuccess}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isSubmitting || !allChecked || maxAllowable <= 0}
                        >
                            {isSubmitting ? 'Recording…' : maxAllowable <= 0 ? 'Balance Covered' : 'Record PDC cheque'}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}
