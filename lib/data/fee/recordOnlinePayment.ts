'use server';


/**
 * Fee & Payment Flow
 
  1. School issues a fee of ₹100 for the student.
 
  2. Platform adds a 2% platform fee:
    - Platform fee = 2% of ₹100 = ₹2
 
  3. Parent pays a total of ₹102 on the payment screen:
    - ₹100 → School fee
    - ₹2   → Platform fee
    - In fee details, parent sees only ₹100 as the school fee.

 4. Payment is collected via PhonePe:
    - Total amount received = ₹102

 5. PhonePe charges a payment gateway (PG) fee:
    - PG fee = 2% of ₹102 = ₹2.04

 6. Settlement:
    - ₹100 is transferred to the school.
    - Platform keeps ₹2 as its platform fee.
    - Platform pays ₹2.04 as PhonePe PG charges.

 7. Net result for platform:
    - Platform income: ₹2.00
    - Platform expense (PG): ₹2.04
    - Net platform loss: ₹0.04 per transaction

 Note:
 - PG charges are applied on the total collected amount (fee + platform fee).
 - The school always receives the full issued fee.
 */

// School Fee: ₹100.00
// Platform Fee: ₹2.00
// Total Paid: ₹102.00
// Payment Processing Fee: ₹2.04 (paid by school)
// Shiksha Cloud (Platform) transfer to school: ₹100 - 2.04 = ₹97.96
// Shiksha Cloud : ₹2.00 

// Fee issued: ₹100 (Sameer Kad)
// Platform fee added: 2% of ₹100 = ₹2
// Parent pays: ₹102 on payment screen but in fees sees on only 100 rs as fees 
// Shiksha Cloud receives: ₹102 (via PhonePe)
// 2% PhonePe Payment Getway charges 2% of ₹102 = ₹2.04
// Shiksha Cloud (Platform) transfer to school: ₹100
// Shiksha Cloud (Platform) keep: 2% as platform fee and 2% on (Fee Issued + Platform fee) as PhonePe charges
// PhonePe charges ~2% payment gateway (PG) fee on the incoming transaction.


// New Method  
// Platform fee:  ₹2.50  (2.5% of ₹100)
// Parent pays:   ₹102.50
// PhonePe PG:    ₹2.05  (2% of ₹102.50)
// Shiksha net:   +₹0.45 profit per transaction ✅
import { createHash, randomUUID, randomBytes } from 'crypto';

import {
  PaymentMethod,
  PaymentStatus,
  FeeStatus,
} from '@/generated/prisma/enums';
import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import { revalidatePath } from 'next/cache';
import { getCurrentUserId } from '@/lib/user';
import { notify } from '@/lib/notifications/notify';
import { preparePaymentReceipt } from './preparePaymentReceipt';
import { getFeeBalance, syncFeeBalance } from './fee-balance';
import type { FeeRecord } from '@/types';

function generateSha256(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

export async function generateTransactionId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = randomBytes(3).toString("hex").toUpperCase();
  return `TXN_${date}_${rand}`;
}
export const phonePayInitPayment = async (
  feeId: string,
  options: { payerId?: string; note?: string } = {}
) => {
  const currentUserId = await getCurrentUserId();
  const userId = options.payerId || currentUserId;
  const organizationId = await getOrganizationId();
  const transactionId = await generateTransactionId();


  // Validate environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_PAYMENT_MERCHANT_ID',
    'NEXT_PUBLIC_SALT_KEY',
    'NEXT_PUBLIC_SALT_INDEX',
    'NEXT_PUBLIC_PHONE_PAY_HOST_URL',
    'NEXT_PUBLIC_APP_URL',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`Missing environment variable: ${envVar}`);
      throw new Error(`Missing environment variable: ${envVar}`);
    }
  }

  const fee = await prisma.fee.findFirst({
    where: { id: feeId, organizationId },
    select: {
      id: true,
      status: true,
      feeCategory: { select: { name: true } },
      studentId: true,
      totalFee: true,
      dueDate: true,
      student: { select: { firstName: true, lastName: true } },
      payments: {
        select: {
          amount: true,
          status: true,
        },
      },
    }
  });

  if (!fee) throw new Error('Fee not found');
  const currentBalance = getFeeBalance(fee);
  if (currentBalance.status === FeeStatus.PAID) throw new Error('Fee already paid');

  const pendingAmount = currentBalance.dueAmount;

  if (pendingAmount <= 0) {
    throw new Error('No outstanding amount to pay');
  }

  const platformFee = parseFloat((pendingAmount * 0.025).toFixed(2));

  const totalPayableAmount = pendingAmount + platformFee;
  const payload = {
    merchantId: process.env.NEXT_PUBLIC_PAYMENT_MERCHANT_ID,
    merchantTransactionId: transactionId,
    merchantUserId: 'MUID-' + randomUUID().toString().slice(-6),
    amount: Math.round(totalPayableAmount * 100),
    redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/phonepay-callback/${transactionId}`,
    redirectMode: 'REDIRECT',
    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/phonepay-callback/${transactionId}`,
    paymentInstrument: {
      type: 'PAY_PAGE',
    },
  };

  console.log('Payment Payload:', payload);

  const dataPayload = JSON.stringify(payload);
  const dataBase64 = Buffer.from(dataPayload).toString('base64');

  const stringToHash =
    dataBase64 + '/pg/v1/pay' + process.env.NEXT_PUBLIC_SALT_KEY;

  const dataSha256 = generateSha256(stringToHash);
  const checksum = dataSha256 + '###' + process.env.NEXT_PUBLIC_SALT_INDEX;

  console.log('Checksum generated:', checksum);

  const PAY_API_URL = `${process.env.NEXT_PUBLIC_PHONE_PAY_HOST_URL}/pg/v1/pay`;

  try {
    const response = await fetch(PAY_API_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': process.env.NEXT_PUBLIC_PAYMENT_MERCHANT_ID!,
      },
      body: JSON.stringify({ request: dataBase64 }),
    });

    const responseData = await response.json();
    console.log('Payment API Response:', responseData);

    if (!response.ok) {
      console.error('API Error Details:', responseData);
      throw new Error(
        `Payment API error: ${response.status} ${response.statusText}. Details: ${JSON.stringify(responseData)}`
      );
    }

    if (
      responseData.success &&
      responseData.data?.instrumentResponse?.redirectInfo?.url
    ) {
      const receiptNumber = `REC-${randomUUID().slice(0, 8).toUpperCase()}`;
      // Only create database record AFTER successful PhonePe response
      await prisma.feePayment.create({
        data: {
          feeId: fee.id,
          amount: pendingAmount, // store only actual fee, not platformFe
          status: PaymentStatus.PENDING,
          paymentMethod: PaymentMethod.UPI,
          receiptNumber,
          transactionId: transactionId,
          note: options.note || 'Payment initiated via online portal',
          payerId: userId,
          organizationId: organizationId,
          platformFee,
          recordedBy: currentUserId,
          // Track when payment was initiated for timeout/validation checks
          createdAt: new Date(),
        },
      });

      revalidatePath('/dashboard/fees');
      return {
        success: true,
        redirectUrl: responseData.data.instrumentResponse.redirectInfo.url,
        transactionId: transactionId,
      };
    } else {
      throw new Error(responseData.message || 'Payment initialization failed');
    }
  } catch (error) {
    console.error('Error in payFeesAction:', error);
    throw error;
  }
};


export const getOnlinePaymentStatus = async (transactionId: string) => {
  const userId = await getCurrentUserId();
  const payment = await prisma.feePayment.findFirst({
    where: {
      transactionId,
      payerId: userId,
    },
    include: {
      fee: {
        include: {
          feeCategory: true,
        },
      },
    },
  });

  return payment;
};

export const getOnlinePaymentReceiptRecord = async (
  transactionId: string,
): Promise<FeeRecord | null> => {
  const userId = await getCurrentUserId();

  const payment = await prisma.feePayment.findFirst({
    where: {
      transactionId,
      payerId: userId,
      status: PaymentStatus.COMPLETED,
    },
    include: {
      fee: {
        include: {
          academicYear: { select: { name: true } },
          organization: {
            select: {
              logo: true,
              contactEmail: true,
              contactPhone: true,
              name: true,
            },
          },
          student: {
            select: {
              id: true,
              userId: true,
              profileImage: true,
              firstName: true,
              lastName: true,
              rollNumber: true,
              email: true,
              phoneNumber: true,
              gradeId: true,
              sectionId: true,
              grade: { select: { id: true, grade: true } },
              section: { select: { id: true, name: true } },
              parents: {
                where: { isPrimary: true },
                select: {
                  isPrimary: true,
                  parent: {
                    select: {
                      id: true,
                      userId: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                      phoneNumber: true,
                      whatsAppNumber: true,
                    },
                  },
                },
              },
            },
          },
          feeCategory: { select: { id: true, name: true, description: true } },
          payments: {
            where: { status: PaymentStatus.COMPLETED },
            include: {
              payer: { select: { firstName: true, lastName: true, email: true } },
              chequeDetail: {
                select: {
                  chequeNumber: true,
                  chequeDate: true,
                  bankName: true,
                  status: true,
                  bounceReason: true,
                },
              },
            },
            orderBy: { paymentDate: 'desc' },
          },
        },
      },
    },
  });

  if (!payment) return null;

  const fee = payment.fee;
  const balance = getFeeBalance({
    totalFee: fee.totalFee,
    dueDate: fee.dueDate,
    payments: fee.payments.map((p) => ({ amount: p.amount, status: p.status })),
  });

  return {
    fee: {
      id: fee.id,
      totalFee: fee.totalFee,
      paidAmount: balance.paidAmount,
      pendingAmount: balance.dueAmount,
      dueDate: fee.dueDate,
      status: balance.status,
      academicYearName: fee.academicYear.name,
      studentId: fee.studentId,
      feeCategoryId: fee.feeCategoryId,
      organizationId: fee.organizationId,
      organizationLogo: fee.organization.logo ?? undefined,
      organizationName: fee.organization.name ?? undefined,
      organizationEmail: fee.organization.contactEmail ?? undefined,
      organizationPhone: fee.organization.contactPhone ?? undefined,
      createdAt: fee.createdAt,
      updatedAt: fee.updatedAt,
    },
    student: {
      id: fee.student.id,
      userId: fee.student.userId,
      profileImage: fee.student.profileImage,
      firstName: fee.student.firstName,
      lastName: fee.student.lastName,
      rollNumber: fee.student.rollNumber,
      email: fee.student.email,
      phoneNumber: fee.student.phoneNumber,
      gradeId: fee.student.gradeId,
      sectionId: fee.student.sectionId,
      parents: fee.student.parents,
    },
    feeCategory: fee.feeCategory,
    grade: fee.student.grade,
    section: fee.student.section,
    payments: fee.payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      paymentDate: p.paymentDate,
      paymentMethod: p.paymentMethod,
      receiptNumber: p.receiptNumber,
      transactionId: p.transactionId,
      feeId: p.feeId,
      status: p.status,
      payer: p.payer,
      chequeDetail: p.chequeDetail,
    })),
  };
};

const mapPhonePePaymentMethod = (type: string | undefined): PaymentMethod => {
  if (!type) return PaymentMethod.ONLINE;
  const t = type.toUpperCase();
  if (t === 'UPI') return PaymentMethod.UPI;
  if (t === 'CARD') return PaymentMethod.CARD;
  if (t === 'NETBANKING') return PaymentMethod.ONLINE;
  return PaymentMethod.ONLINE;
};

const PHONEPE_VERIFY_COOLDOWN_MS = 15_000;
const PHONEPE_STATUS_RETRY_DELAYS_MS = [0, 5_000, 10_000];
const phonePeVerifyAttempts = new Map<string, number>();

function getPhonePeVerifyCooldown(transactionId: string): number {
  const lastAttemptAt = phonePeVerifyAttempts.get(transactionId);
  if (!lastAttemptAt) return 0;
  return Math.max(PHONEPE_VERIFY_COOLDOWN_MS - (Date.now() - lastAttemptAt), 0);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const verifyPhonePePayment = async (
  transactionId: string,
  shouldRevalidate: boolean = true,
) => {
  const merchantId = process.env.NEXT_PUBLIC_PAYMENT_MERCHANT_ID!;
  const saltKey = process.env.NEXT_PUBLIC_SALT_KEY!;
  const saltIndex = process.env.NEXT_PUBLIC_SALT_INDEX!;
  const host = process.env.NEXT_PUBLIC_PHONE_PAY_HOST_URL!;

  // ── 1. Load our payment record ────────────────────────────────────────────
  // Done before session checks so server-to-server callbacks work too.
  const payment = await prisma.feePayment.findFirst({
    where: { transactionId },
    select: {
      id: true,
      status: true,
      amount: true,
      platformFee: true,
      organizationId: true,
      payerId: true,
      feeId: true,
      receiptNumber: true,
      fee: {
        select: {
          id: true,
          studentId: true,
          totalFee: true,
          dueDate: true,
          student: { select: { firstName: true, lastName: true } },
          feeCategory: { select: { name: true } },
        },
      },
    },
  });

  if (!payment) {
    console.error(`[VERIFY_PAYMENT] No record for transactionId=${transactionId}`);
    return { success: false, status: 'NOT_FOUND', message: 'Payment record not found' };
  }

  // ── 2. Idempotency guard ──────────────────────────────────────────────────
  if (payment.status === PaymentStatus.COMPLETED) {
    return { success: true, status: 'COMPLETED', message: 'Payment already verified' };
  }

  // ── 3. Call PhonePe status API ────────────────────────────────────────────
  const cooldownMs = getPhonePeVerifyCooldown(transactionId);
  if (cooldownMs > 0) {
    return {
      success: false,
      status: 'PENDING',
      message: `Verification recently requested. Please retry in ${Math.ceil(cooldownMs / 1000)} seconds.`,
    };
  }

  phonePeVerifyAttempts.set(transactionId, Date.now());

  const relativeUrl = `/pg/v1/status/${merchantId}/${transactionId}`;
  const checksum = generateSha256(relativeUrl + saltKey) + '###' + saltIndex;

  let json: any = null;

  for (let attempt = 0; attempt < PHONEPE_STATUS_RETRY_DELAYS_MS.length; attempt++) {
    const delayMs = PHONEPE_STATUS_RETRY_DELAYS_MS[attempt];
    if (delayMs > 0) await delay(delayMs);

    const res = await fetch(`${host}${relativeUrl}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': merchantId,
      },
      cache: 'no-store',
    });

    if (res.ok) {
      json = await res.json();
      break;
    }

    const errorBody = await res.text();
    console.error(
      `[VERIFY_PAYMENT] PhonePe API error: ${res.status} | attempt ${attempt + 1}/${PHONEPE_STATUS_RETRY_DELAYS_MS.length}`,
      errorBody,
    );

    if (res.status === 429 && attempt < PHONEPE_STATUS_RETRY_DELAYS_MS.length - 1) {
      continue;
    }

    if (res.status === 429) {
      return {
        success: false,
        status: 'PENDING',
        message: 'PhonePe verification is rate limited. Please retry after a few seconds.',
      };
    }

    return { success: false, status: 'API_ERROR', message: 'Failed to verify with provider' };
  }

  if (!json) {
    return { success: false, status: 'PENDING', message: 'PhonePe verification is still pending.' };
  }

  console.log('[VERIFY_PAYMENT] PhonePe response:', JSON.stringify(json, null, 2));

  const state = json?.data?.state;
  const paymentMethodType = json?.data?.paymentInstrument?.type;
  const responseAmount = json?.data?.amount;          // in paise
  const responseMerchantId = json?.data?.merchantId;

  // ── 4. Verify merchant ID integrity ──────────────────────────────────────
  if (responseMerchantId !== merchantId) {
    console.error(`[VERIFY_PAYMENT] Merchant ID mismatch: expected=${merchantId} got=${responseMerchantId}`);
    return { success: false, status: 'ERROR', message: 'Merchant ID mismatch' };
  }

  // ═════════════════════════════════════════════════════════════════════════
  // CASE A — COMPLETED
  // ═════════════════════════════════════════════════════════════════════════
  if (json.success && state === 'COMPLETED') {

    // 4a. Amount integrity check — prevents spoofed callbacks
    const expectedPaise = Math.round((payment.amount + (payment.platformFee ?? 0)) * 100);
    if (responseAmount !== expectedPaise) {
      console.error(`[VERIFY_PAYMENT] Amount mismatch: expected=${expectedPaise} got=${responseAmount}`);
      await prisma.feePayment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.FAILED,
          note: `Amount mismatch: expected ₹${expectedPaise / 100}, got ₹${responseAmount / 100}`,
        },
      });
      return { success: false, status: 'AMOUNT_MISMATCH', message: 'Payment amount mismatch' };
    }

    // 4b. Hoist mutable state so it's accessible after the transaction
    let paidAmount = 0;
    let alreadyCompleted = false;
    const resolvedMethod = mapPhonePePaymentMethod(paymentMethodType);
    const paymentDate = new Date();

    await prisma.$transaction(async (tx) => {
      // Re-check inside tx to guard against concurrent callbacks
      const current = await tx.feePayment.findUnique({ where: { id: payment.id } });
      if (current?.status === PaymentStatus.COMPLETED) {
        alreadyCompleted = true;
        return;
      }

      // Mark payment COMPLETED
      await tx.feePayment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.COMPLETED,
          paymentMethod: resolvedMethod,
          paymentDate,
        },
      });

      // Atomically increment paidAmount — prevents lost updates from concurrent payments
      const balance = await syncFeeBalance(payment.feeId, tx);
      paidAmount = balance.paidAmount;
    });

    // If a concurrent callback already completed this — skip side-effects
    if (alreadyCompleted) {
      return { success: true, status: 'COMPLETED', message: 'Payment already verified' };
    }

    // 4c. Generate receipt PDF and notify
    const totalPayableAmount = payment.amount + (payment.platformFee ?? 0);

    if (shouldRevalidate) {
      try {
        revalidatePath('/dashboard/fees');
        revalidatePath('/dashboard/fees/student');
        revalidatePath('/dashboard/fees/admin/assign');
      } catch (e) {
        console.warn('[VERIFY_PAYMENT] Revalidation skipped:', e);
      }
    }

    const { feeRecord, pdfBuffer } = await preparePaymentReceipt(
      payment.feeId,
      payment.organizationId,   // in select — no getOrganizationId() needed here
      {
        amount: paidAmount,           // hoisted let, correctly populated above
        paymentDate,
        paymentMethod: resolvedMethod, // resolved before tx — not payment.paymentMethod (still PENDING)
        receiptNumber: payment.receiptNumber!,
        transactionId,                // function param — not in select, use this directly
        status: PaymentStatus.COMPLETED,
        payerId: payment.payerId,
      },
    );

    await notify.fee.paymentSuccess({
      feeId: payment.feeId,
      eventId: `fee:${payment.feeId}:payment:${payment.receiptNumber}`,
      recipients: [{ studentId: payment.fee.studentId }],
      attachment: {
        filename: `Receipt-${payment.receiptNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
      variables: {
        studentName: `${feeRecord.student.firstName} ${feeRecord.student.lastName}`,
        receiptNumber: payment.receiptNumber!,
        receiptUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/fees/?txn=${transactionId}`,
        feeName: feeRecord.feeCategory.name,
        amount: totalPayableAmount,
        paymentMethod: resolvedMethod,
        paidAt: paymentDate,
      },
    });

    return { success: true, status: 'COMPLETED' };
  }

  // ═════════════════════════════════════════════════════════════════════════
  // CASE B — FAILED
  // ═════════════════════════════════════════════════════════════════════════
  if (state === 'FAILED' || json.success === false) {

    // Mark the payment FAILED
    await prisma.feePayment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.FAILED,
        note: `PhonePe payment failed. State: ${state ?? 'unknown'}`,
      },
    });

    // Recalculate fee status from remaining COMPLETED payments
    // (A prior partial payment may have moved the fee to PARTIAL/UNPAID already —
    //  re-derive from source-of-truth rather than assuming UNPAID.)
    await syncFeeBalance(payment.feeId);

    notify.fee.paymentFailed({
      feeId: payment.feeId,
      recipients: [{ studentId: payment.fee.studentId }],
      variables: {
        studentName: `${payment.fee.student.firstName} ${payment.fee.student.lastName}`,
        feeName: payment.fee.feeCategory.name,
        amount: payment.amount + (payment.platformFee ?? 0),
        transactionId,
        paymentLink: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        failedAt: new Date(),
      },
    });

    if (shouldRevalidate) {
      try {
        revalidatePath('/dashboard/fees');
        revalidatePath('/dashboard/fees/student');
      } catch (e) {
        console.warn('[VERIFY_PAYMENT] Revalidation skipped:', e);
      }
    }

    return { success: false, status: 'FAILED' };
  }

  // ═════════════════════════════════════════════════════════════════════════
  // CASE C — PENDING / PAYMENT_INITIATED / any other transient state
  // ═════════════════════════════════════════════════════════════════════════
  return {
    success: false,
    status: 'PENDING',
    message: json.message || 'Payment is still processing',
  };
};
