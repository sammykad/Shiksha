import prisma from '@/lib/db';
import { Prisma } from '@/generated/prisma/client';

type ReceiptClient = typeof prisma | Prisma.TransactionClient;

const SAFE_ID_RE = /^[\w-]+$/;

export async function generateReceiptNumber(
  organizationId: string,
  prefix: string = 'REC',
  client: ReceiptClient = prisma,
): Promise<string> {
  if (!SAFE_ID_RE.test(organizationId)) {
    throw new Error(`Invalid organizationId: contains unsafe characters`);
  }

  const seqName = `receipt_number_seq_${organizationId.replace(/-/g, '_')}`;

  await client.$executeRawUnsafe(
    `CREATE SEQUENCE IF NOT EXISTS "${seqName}" START 1`
  );

  const year = new Date().getFullYear();
  const [result] = await client.$queryRawUnsafe<[{ nextval: bigint }]>(
    `SELECT nextval('"${seqName}"') AS nextval`
  );

  const seq = Number(result.nextval).toString().padStart(6, '0');
  return `${prefix}-${year}-${seq}`;
}
