import { NextResponse } from 'next/server';
import { verifyPhonePePayment } from '@/lib/data/fee/recordOnlinePayment';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  const { transactionId } = await params;
  const shouldVerify = new URL(request.url).searchParams.get('verify') === '1';

  console.log(`[PHONE_PE_CALLBACK_GET] Redirect received for: ${transactionId}`);

  try {
    const result = await verifyPhonePePayment(transactionId);
    console.log(
      `[PHONE_PE_CALLBACK_GET] ${shouldVerify ? 'Manual' : 'Redirect'} verification result for ${transactionId}:`,
      result,
    );
  } catch (error) {
    console.error(`[PHONE_PE_CALLBACK_GET_ERROR] ${transactionId}:`, error);
  }

  const redirectUrl = new URL(
    '/dashboard/fees',
    process.env.NEXT_PUBLIC_APP_URL
  );
  redirectUrl.searchParams.set('txn', transactionId);

  return NextResponse.redirect(redirectUrl.toString(), { status: 302 });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  const { transactionId } = await params;
  console.log(`[PHONE_PE_CALLBACK_POST] Received callback for: ${transactionId}`);

  try {
    // Verify payment status with PhonePe and update DB
    const result = await verifyPhonePePayment(transactionId);
    console.log(`[PHONE_PE_CALLBACK_POST] Result for ${transactionId}:`, result);

    return NextResponse.json({
      success: result.success,
      status: result.status
    });
  } catch (error) {
    console.error(`[PHONE_PE_CALLBACK_POST_ERROR] ${transactionId}:`, error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
