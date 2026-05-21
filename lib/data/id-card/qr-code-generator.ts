import QRCode from 'qrcode';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function generateVerificationQRCode(cardNumber: string, color?: string): Promise<string> {
  const verificationUrl = `${APP_URL}/verify/id-card/${cardNumber}`;

  return QRCode.toDataURL(verificationUrl, {
    width: 200,
    margin: 1,
    errorCorrectionLevel: 'H',
    color: { dark: color || '#0f172a', light: '#ffffff' },
  });
}
