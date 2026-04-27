const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');
  // No default admin anymore to allow the Setup Wizard to handle it
  // But we can ensure some default settings if needed
  console.log('Seed complete. Ready for Setup Wizard.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
