import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';

const ROOT = process.cwd();
const SCAN_DIRS = ['app', 'components', 'lib'];
const ALLOWED = new Set([
  'lib/data/fee/fee-balance.ts',
  'lib/data/fee/recordOfflinePayment.ts',
  'lib/data/fee/recordOnlinePayment.ts',
  'lib/data/fee/recordPdcPayment.ts',
  'lib/data/fee/resolvePdcCheque.ts',
  'tools/fee/repair-fee-payments.ts',
  'tools/fee/check-fee-balance-usage.ts',
]);

const PATTERNS = [
  /totalFee\s*-\s*fee\.paidAmount/,
  /_sum\s*:\s*\{\s*paidAmount/,
  /_sum\s*:\s*\{\s*pendingAmount/,
  /sum\s*\+\s*fee\.paidAmount/,
  /fee\.pendingAmount\s*\?\?/,
];

function listFiles(dir: string): string[] {
  const fullDir = join(ROOT, dir);
  return readdirSync(fullDir).flatMap((entry) => {
    const fullPath = join(fullDir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) return listFiles(relative(ROOT, fullPath));
    if (!/\.(ts|tsx)$/.test(entry)) return [];
    return [relative(ROOT, fullPath).replace(/\\/g, '/')];
  });
}

const violations = SCAN_DIRS.flatMap(listFiles).flatMap((file) => {
  if (ALLOWED.has(file)) return [];

  const content = readFileSync(join(ROOT, file), 'utf8');
  return content
    .split(/\r?\n/)
    .flatMap((line, index) =>
      PATTERNS.some((pattern) => pattern.test(line))
        ? [`${file}:${index + 1}: ${line.trim()}`]
        : [],
    );
});

if (violations.length > 0) {
  console.error('Direct fee money calculations found. Use lib/data/fee/fee-balance.ts instead.\n');
  console.error(violations.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Fee balance usage check passed.');
}

