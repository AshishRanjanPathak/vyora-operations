import defaultProductService, { ProductService } from '../services/productService.js';

export class ProductController {
  /**
   * Dependency Inversion Principle (DIP):
   * Injects productService via constructor.
   * @param {ProductService} productService
   */
  constructor(productService = defaultProductService) {
    this.productService = productService;
  }

  getProducts = async (req, res, next) => {
    try {
      const result = await this.productService.getProducts(req.query);

      res.status(200).json({
        success: true,
        data: result.products,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductById(id);

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  createProduct = async (req, res, next) => {
    try {
      const product = await this.productService.createProduct(req.body);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  updateProduct = async (req, res, next) => {
    try {
      const { id } = req.params;
      const product = await this.productService.updateProduct(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteProduct = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.productService.deleteProduct(id);

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new ProductController();