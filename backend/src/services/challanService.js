import prisma from '../config/database.js';
import defaultChallanRepository from '../repositories/challanRepository.js';
import defaultCustomerRepository from '../repositories/customerRepository.js';
import defaultProductRepository from '../repositories/productRepository.js';
import defaultStockRepository from '../repositories/stockRepository.js';
import { generateChallanNumber } from '../utils/challanNumber.js';
import { NotFoundError, ValidationError, ConflictError } from '../errors/AppError.js';

export class ChallanService {
  /**
   * Dependency Inversion Principle (DIP):
   * Injects repositories and prisma instance for transactions.
   */
  constructor(
    challanRepo = defaultChallanRepository,
    customerRepo = defaultCustomerRepository,
    productRepo = defaultProductRepository,
    stockRepo = defaultStockRepository,
    db = prisma
  ) {
    this.challanRepo = challanRepo;
    this.customerRepo = customerRepo;
    this.productRepo = productRepo;
    this.stockRepo = stockRepo;
    this.db = db;
  }

  async getChallans(query) {
    const { page = 1, limit = 10, customerId, status, search } = query;

    const where = {};
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;
    if (search && search.trim() !== '') {
      where.challanNumber = { contains: search.trim(), mode: 'insensitive' };
    }

    const skip = (page - 1) * limit;
    const take = limit;

    const [challans, total] = await Promise.all([
      this.challanRepo.findMany({ where, skip, take }),
      this.challanRepo.count(where),
    ]);

    return {
      challans,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getChallanById(id) {
    const challan = await this.challanRepo.findById(id);
    if (!challan) {
      throw new NotFoundError(`Challan with ID '${id}' not found`);
    }
    return challan;
  }

  async createDraftChallan({ customerId, items }, userId) {
    // 1. Verify customer exists
    const customer = await this.customerRepo.findById(customerId);
    if (!customer) {
      throw new NotFoundError(`Customer with ID '${customerId}' not found`);
    }

    // 2. Fetch live products and capture price/name snapshots
    const snapshotItems = [];
    let totalQuantity = 0;

    for (const item of items) {
      const product = await this.productRepo.findById(item.productId);
      if (!product) {
        throw new NotFoundError(`Product with ID '${item.productId}' not found`);
      }

      totalQuantity += item.quantity;

      // Crucial Snapshot pattern: Preserve exact terms at time of draft creation
      snapshotItems.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unitPrice: product.unitPrice,
        quantity: item.quantity,
      });
    }

    return this.db.$transaction(async (tx) => {
      // 3. Generate sequential challan number (e.g. CH-2026-0001)
      const challanNumber = await generateChallanNumber(tx);

      // 4. Create challan + line items in DRAFT status (NO stock change)
      return this.challanRepo.create(
        {
          challanNumber,
          customerId,
          totalQuantity,
          status: 'DRAFT',
          createdById: userId,
          items: {
            create: snapshotItems,
          },
        },
        tx
      );
    });
  }

  async confirmChallan(id, userId) {
    return this.db.$transaction(async (tx) => {
      // 1. Fetch live challan with items inside transaction
      const challan = await this.challanRepo.findById(id, tx);
      if (!challan) {
        throw new NotFoundError(`Challan with ID '${id}' not found`);
      }

      // 2. Status validity checks
      if (challan.status === 'CONFIRMED') {
        throw new ConflictError(`Challan #${challan.challanNumber} is already confirmed`);
      }
      if (challan.status === 'CANCELLED') {
        throw new ValidationError(`Cannot confirm cancelled Challan #${challan.challanNumber}`);
      }

      // 3. Stock validation for all products
      for (const item of challan.items) {
        const product = await this.productRepo.findById(item.productId, tx);
        if (!product) {
          throw new NotFoundError(`Product '${item.productName}' no longer exists in catalog`);
        }

        if (product.currentStock < item.quantity) {
          throw new ValidationError(
            `Insufficient stock for '${item.productName}' (${item.sku}). Available: ${product.currentStock}, Required: ${item.quantity}`
          );
        }
      }

      // 4. All products verified -> Reduce stock and create OUT movement audit logs
      for (const item of challan.items) {
        const product = await this.productRepo.findById(item.productId, tx);
        const newStock = product.currentStock - item.quantity;

        // Decrement stock
        await this.productRepo.update(item.productId, { currentStock: newStock }, tx);

        // Record OUT stock movement
        await this.stockRepo.create(
          {
            productId: item.productId,
            quantity: item.quantity,
            type: 'OUT',
            reason: `Sales Challan #${challan.challanNumber}`,
            createdById: userId,
          },
          tx
        );
      }

      // 5. Update Challan status to CONFIRMED
      return this.challanRepo.updateStatus(id, 'CONFIRMED', tx);
    });
  }

  async cancelChallan(id, userId) {
    return this.db.$transaction(async (tx) => {
      const challan = await this.challanRepo.findById(id, tx);
      if (!challan) {
        throw new NotFoundError(`Challan with ID '${id}' not found`);
      }

      if (challan.status === 'CANCELLED') {
        throw new ConflictError(`Challan #${challan.challanNumber} is already cancelled`);
      }

      // If challan was CONFIRMED, restore stock and create IN stock movements
      if (challan.status === 'CONFIRMED') {
        for (const item of challan.items) {
          const product = await this.productRepo.findById(item.productId, tx);
          if (product) {
            const newStock = product.currentStock + item.quantity;

            // Increment restored stock
            await this.productRepo.update(item.productId, { currentStock: newStock }, tx);

            // Record IN stock movement for cancellation
            await this.stockRepo.create(
              {
                productId: item.productId,
                quantity: item.quantity,
                type: 'IN',
                reason: `Cancellation of Sales Challan #${challan.challanNumber}`,
                createdById: userId,
              },
              tx
            );
          }
        }
      }

      // Update status to CANCELLED
      return this.challanRepo.updateStatus(id, 'CANCELLED', tx);
    });
  }
}

export default new ChallanService();