import prisma from '../config/database.js';

export class DashboardService {
  constructor(db = prisma) {
    this.db = db;
  }

  async getStats() {
    const [
      totalCustomers,
      totalProducts,
      allProducts,
      draftChallans,
      confirmedChallans,
      recentChallans,
    ] = await Promise.all([
      this.db.customer.count(),
      this.db.product.count(),
      this.db.product.findMany({
        select: { id: true, currentStock: true, minimumStock: true },
      }),
      this.db.challan.count({ where: { status: 'DRAFT' } }),
      this.db.challan.count({ where: { status: 'CONFIRMED' } }),
      this.db.challan.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, businessName: true },
          },
        },
      }),
    ]);

    // Count products where currentStock <= minimumStock
    const lowStockCount = allProducts.filter(
      (p) => p.currentStock <= p.minimumStock
    ).length;

    return {
      totalCustomers,
      totalProducts,
      lowStockProducts: lowStockCount,
      draftChallans,
      confirmedChallans,
      recentChallans,
    };
  }
}

export default new DashboardService();