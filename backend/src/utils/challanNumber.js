import prisma from '../config/database.js';

/**
 * Generates sequential challan numbers in format: CH-YYYY-XXXX (e.g., CH-2026-0001)
 * @param {import('@prisma/client').PrismaClient} tx
 */
export const generateChallanNumber = async (tx = prisma) => {
  const currentYear = new Date().getFullYear();
  const prefix = `CH-${currentYear}-`;

  const latestChallan = await tx.challan.findFirst({
    where: {
      challanNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      challanNumber: 'desc',
    },
    select: {
      challanNumber: true,
    },
  });

  if (!latestChallan) {
    return `${prefix}0001`;
  }

  const lastNumberStr = latestChallan.challanNumber.replace(prefix, '');
  const nextNumber = parseInt(lastNumberStr, 10) + 1;
  const paddedNumber = String(nextNumber).padStart(4, '0');

  return `${prefix}${paddedNumber}`;
};