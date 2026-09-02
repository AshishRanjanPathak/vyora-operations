import prisma from '../config/database.js';
import defaultStockRepository from '../repositories/stockRepository.js';
import defaultProductRepository from '../repositories/productRepository.js';
import { NotFoundError, ValidationError } from '../errors/AppError.js';

export class StockService {
  /**
   * Dependency Inversion Principle (DIP):
   * Injects repositories and db client for transactions.
   */
  constructor(
    stockRepo = defaultStockRepository,
    productRepo = defaultProductRepository,
    db = prisma
  ) {
    this.stockRepo = stockRepo;
    this.productRepo = productRepo;
    this.db = db;
  }

  async getMovements(query) {
    const { page = 1, limit = 10, productId, type } = query;

    const where = {};
    if (productId) where.productId = productId;
    if (type) where.type = type;

    const skip = (page - 1) * limit;
    const take = limit;

    const [movements, total] = await Promise.all([
      this.stockRepo.findMany({ where, skip, take }),
      this.stockRepo.count(where),
    ]);

    return {
      movements,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async recordMovement({ productId, quantity, type, reason }, userId) {
    // Execute atomic transaction for stock update and movement audit log
    return this.db.$transaction(async (tx) => {
      // 1. Fetch current product state inside transaction
      const product = await this.productRepo.findById(productId, tx);
      if (!product) {
        throw new NotFoundError(`Product with ID '${productId}' not found`);
      }

      // 2. Business Rule: Prevent negative stock
      if (type === 'OUT' && product.currentStock < quantity) {
        throw new ValidationError(
          `Insufficient stock for '${product.name}'. Available: ${product.currentStock}, Requested: ${quantity}`
        );
      }

      // 3. Compute new stock level
      const newStock =
        type === 'IN'
          ? product.currentStock + quantity
          : product.currentStock - quantity;

      // 4. Update product currentStock
      const updatedProduct = await this.productRepo.update(
        productId,
        { currentStock: newStock },
        tx
      );

      // 5. Create stock movement audit record
      const safeReason = (reason && reason.trim()) || 'Manual stock adjustment';
      const movement = await this.stockRepo.create(
        {
          productId,
          quantity,
          type,
          reason: safeReason,
          createdById: userId,
        },
        tx
      );

      return {
        movement,
        newStock: updatedProduct.currentStock,
        isLowStock: updatedProduct.currentStock <= updatedProduct.minimumStock,
      };
    });
  }
}

export default new StockService();