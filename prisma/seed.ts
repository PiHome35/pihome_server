import { PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common';

const prisma = new PrismaClient();
const logger = new Logger('PrismaSeed');

async function main() {
  logger.log('Starting seed...');

  try {
    await prisma.chatModel.createMany({
      data: [
        {
          key: 'gpt-4o',
          name: 'GPT-4o',
        },
        {
          key: 'gpt-4o-mini',
          name: 'GPT-4o Mini',
        },
        {
          key: 'gemini-1.5-flash',
          name: 'Gemini 1.5 Flash',
        },
      ],
      skipDuplicates: true,
    });

    logger.log('Seed completed successfully');
  } catch (error) {
    logger.error('Seed failed');
    logger.error(error);
    throw error;
  }
}

main()
  .catch((e) => {
    logger.error('Seed failed in main catch block');
    logger.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
