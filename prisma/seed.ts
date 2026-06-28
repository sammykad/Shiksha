import 'dotenv/config';

const usage = `
Usage: npx tsx prisma/seed.ts [seed-name]

Seeds:
  real-school       Shree Gurukul Vidyalaya — Pune (default)
  indian-school     SVM English Medium School — Indian data
  transport         Transport route seed
  bulk-students     Bulk add 7000 students
`.trim();

async function main() {
  const seedName = process.argv[2] || 'real-school';

  switch (seedName) {
    case 'real-school': {
      await import('./seeds/real-school');
      break;
    }
    case 'indian-school': {
      await import('./seeds/indian-school');
      break;
    }
    case 'transport': {
      await import('./seeds/transport');
      break;
    }
    case 'bulk-students': {
      await import('./seeds/bulk-students');
      break;
    }
    default: {
      console.log(`Unknown seed: "${seedName}"`);
      console.log(usage);
      process.exit(1);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
