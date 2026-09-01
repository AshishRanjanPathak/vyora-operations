import defaultProductRepository from '../repositories/productRepository.js';
import { NotFoundError, ConflictError } from '../errors/AppError.js';

export class ProductService {
  /**
   * Dependency Inversion Principle (DIP):
   * Injects product repository via constructor with default fallback.
   * @param {typeof defaultProductRepository} productRepo
   */
  constructor(productRepo = defaultProductRepository) {
    this.productRepo = productRepo;
  }

  async getProducts(query) {
    const { page = 1, limit = 10, search, category, lowStock } = query;

    const where = {};

    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { sku: { contains: searchTerm, mode: 'insensitive' } },
        { category: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;
    const take = limit;

    const [rawProducts, total] = await Promise.all([
      this.productRepo.findMany({ where, skip, take }),
      this.productRepo.count(where),
    ]);

    let products = rawProducts.map((product) => ({
      ...product,
      isLowStock: product.currentStock <= product.minimumStock,
    }));

    if (lowStock === true || lowStock === 'true') {
      products = products.filter((p) => p.isLowStock);
    }

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getProductById(id) {
    const product = await this.productRepo.findById(id);
    if (!product) {
      throw new NotFoundError(`Product with ID '${id}' not found`);
    }

    return {
      ...product,
      isLowStock: product.currentStock <= product.minimumStock,
    };
  }

  async createProduct(data) {
    const existing = await this.productRepo.findBySku(data.sku);
    if (existing) {
      throw new ConflictError(`Product with SKU '${data.sku}' already exists`);
    }

    const product = await this.productRepo.create({
      name: data.name.trim(),
      sku: data.sku.trim().toUpperCase(),
      category: data.category.trim(),
      unitPrice: data.unitPrice,
      currentStock: data.currentStock || 0,
      minimumStock: data.minimumStock || 0,
      warehouseLocation: data.warehouseLocation ? data.warehouseLocation.trim() : null,
    });

    return {
      ...product,
      isLowStock: product.currentStock <= product.minimumStock,
    };
  }

  async updateProduct(id, data) {
    await this.getProductById(id);

    if (data.sku) {
      const existing = await this.productRepo.findBySku(data.sku);
      if (existing && existing.id !== id) {
        throw new ConflictError(`SKU '${data.sku}' is already used by another product`);
      }
    }

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.sku !== undefined) updateData.sku = data.sku.trim().toUpperCase();
    if (data.category !== undefined) updateData.category = data.category.trim();
    if (data.unitPrice !== undefined) updateData.unitPrice = data.unitPrice;
    if (data.currentStock !== undefined) updateData.currentStock = data.currentStock;
    if (data.minimumStock !== undefined) updateData.minimumStock = data.minimumStock;
    if (data.warehouseLocation !== undefined) updateData.warehouseLocation = data.warehouseLocation ? data.warehouseLocation.trim() : null;

    const updated = await this.productRepo.update(id, updateData);
    return {
      ...updated,
      isLowStock: updated.currentStock <= updated.minimumStock,
    };
  }

  async deleteProduct(id) {
    const product = await this.getProductById(id);

    // Business integrity rule: cannot delete product if referenced in movements or challans
    if (product._count?.challanItems > 0 || product._count?.stockMovements > 0) {
      throw new ConflictError(
        'Cannot delete product because it has associated stock movements or sales challans'
      );
    }

    return this.productRepo.delete(id);
  }
}

export default new ProductService();