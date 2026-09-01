import prisma from '../config/database.js';

class StockRepository {
  async findMany({ where, skip, take }) {
    return prisma.stockMovement.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: { id: true, name: true, sku: true, currentStock: true, unitPrice: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  }

  async count(where) {
    return prisma.stockMovement.count({ where });
  }

  async create(data, tx = prisma) {
    return tx.stockMovement.create({
      data,
      include: {
        product: {
          select: { id: true, name: true, sku: true, currentStock: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  }
}

export default new StockRepository();