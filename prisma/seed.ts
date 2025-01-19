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
          isEnabled: true,
          maxTokens: 8192,
          description: 'Optimized version of GPT-4 for specific tasks',
          pricePerToken: 0.00003, // Example pricing
        },
        {
          key: 'gpt-4o-mini',
          name: 'GPT-4o Mini',
          isEnabled: true,
          maxTokens: 4096,
          description: 'Smaller, faster version of GPT-4o',
          pricePerToken: 0.000015, // Example pricing
        },
        {
          key: 'gemini-1.5-flash',
          name: 'Gemini 1.5 Flash',
          isEnabled: true,
          maxTokens: 32768,
          description: 'High-speed version of Gemini 1.5 for rapid tasks',
          pricePerToken: 0.00002, // Example pricing
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
