import assert from 'assert';
import { FeeStatus, PaymentStatus } from '@/generated/prisma/enums';
import { getFeeBalance, getFeesSummary } from '@/lib/data/fee/fee-balance';

const future = new Date('2099-01-01');
const past = new Date('2020-01-01');

assert.deepStrictEqual(
  getFeeBalance({ totalFee: 1000, dueDate: future, payments: [] }),
  {
    totalAmount: 1000,
    paidAmount: 0,
    dueAmount: 1000,
    status: FeeStatus.UNPAID,
    collectionPercent: 0,
  },
);

assert.strictEqual(
  getFeeBalance({
    totalFee: 1000,
    dueDate: future,
    payments: [{ amount: 400, status: PaymentStatus.COMPLETED }],
  }).dueAmount,
  600,
);

assert.strictEqual(
  getFeeBalance({
    totalFee: 1000,
    dueDate: future,
    payments: [
      { amount: 400, status: PaymentStatus.FAILED },
      { amount: 400, status: PaymentStatus.PENDING },
      { amount: 400, status: PaymentStatus.CANCELLED },
      { amount: 400, status: PaymentStatus.CHEQUE_PENDING },
    ],
  }).paidAmount,
  0,
);

assert.strictEqual(
  getFeeBalance({
    totalFee: 1000,
    dueDate: future,
    payments: [{ amount: 1000, status: PaymentStatus.COMPLETED }],
  }).status,
  FeeStatus.PAID,
);

assert.strictEqual(
  getFeeBalance({ totalFee: 1000, dueDate: past, payments: [] }).status,
  FeeStatus.OVERDUE,
);

const summary = getFeesSummary([
  {
    totalFee: 1000,
    dueDate: future,
    studentId: 'student-1',
    payments: [{ amount: 1000, status: PaymentStatus.COMPLETED }],
  },
  {
    totalFee: 1000,
    dueDate: past,
    studentId: 'student-2',
    payments: [{ amount: 250, status: PaymentStatus.COMPLETED }],
  },
]);

assert.strictEqual(summary.totalAmount, 2000);
assert.strictEqual(summary.paidAmount, 1250);
assert.strictEqual(summary.dueAmount, 750);
assert.strictEqual(summary.overdueAmount, 750);
assert.strictEqual(summary.paidStudents, 1);
assert.strictEqual(summary.dueStudents, 1);

console.log('Fee balance tests passed.');

