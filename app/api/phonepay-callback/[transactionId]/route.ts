import { after } from 'next/server';
import { NextRequest, NextResponse } from 'next/server';
import { verifyPhonePePayment } from '@/lib/data/fee/recordOnlinePayment';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  const { transactionId } = await params;

  after(async () => {
    await verifyPhonePePayment(transactionId);
  });

  const redirectUrl = new URL(
    '/dashboard/fees',
    process.env.NEXT_PUBLIC_APP_URL
  );
  redirectUrl.searchParams.set('txn', transactionId);

  return NextResponse.redirect(redirectUrl.toString(), { status: 302 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  const { transactionId } = await params;

  try {
    const result = await verifyPhonePePayment(transactionId);

    return NextResponse.json({
      success: result.success,
      status: result.status
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
