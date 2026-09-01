import prisma from '../config/database.js';

class ProductRepository {
  async findMany({ where, skip, take }) {
    return prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { stockMovements: true, challanItems: true },
        },
      },
    });
  }

  async count(where) {
    return prisma.product.count({ where });
  }

  async findById(id, tx = prisma) {
    return tx.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: { stockMovements: true, challanItems: true },
        },
      },
    });
  }

  async findBySku(sku) {
    return prisma.product.findUnique({
      where: { sku },
    });
  }

  async create(data) {
    return prisma.product.create({
      data,
    });
  }

  async update(id, data, tx = prisma) {
    return tx.product.update({
      where: { id },
      data,
    });
  }

  async delete(id) {
    return prisma.product.delete({
      where: { id },
    });
  }
}

export default new ProductRepository();