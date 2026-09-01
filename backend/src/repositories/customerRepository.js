import prisma from '../config/database.js';

class CustomerRepository {
  async findMany({ where, skip, take }) {
    return prisma.customer.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        _count: {
          select: { followUps: true, challans: true },
        },
      },
    });
  }

  async count(where) {
    return prisma.customer.count({ where });
  }

  async findById(id) {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        followUps: {
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
      },
    });
  }

  async create(data) {
    return prisma.customer.create({
      data,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  }

  async update(id, data) {
    return prisma.customer.update({
      where: { id },
      data,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  }

  async delete(id) {
    return prisma.customer.delete({
      where: { id },
    });
  }

  async createFollowUp(data) {
    return prisma.customerFollowUp.create({
      data,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  }
}

export default new CustomerRepository();