import prisma from '../config/database.js';

class ChallanRepository {
  async findMany({ where, skip, take }) {
    return prisma.challan.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: { id: true, name: true, businessName: true, mobile: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        _count: {
          select: { items: true },
        },
      },
    });
  }

  async count(where) {
    return prisma.challan.count({ where });
  }

  async findById(id, tx = prisma) {
    return tx.challan.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            businessName: true,
            mobile: true,
            email: true,
            address: true,
            gstNumber: true,
          },
        },
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        items: {
          orderBy: { id: 'asc' },
          include: {
            product: {
              select: { id: true, currentStock: true, minimumStock: true },
            },
          },
        },
      },
    });
  }

  async create(data, tx = prisma) {
    return tx.challan.create({
      data,
      include: {
        customer: {
          select: { id: true, name: true, businessName: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        items: true,
      },
    });
  }

  async updateStatus(id, status, tx = prisma) {
    return tx.challan.update({
      where: { id },
      data: { status },
      include: {
        customer: {
          select: { id: true, name: true, businessName: true },
        },
        items: true,
      },
    });
  }
}

export default new ChallanRepository();