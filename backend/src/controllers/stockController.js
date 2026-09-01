import defaultStockService, { StockService } from '../services/stockService.js';

export class StockController {
  /**
   * Dependency Inversion Principle (DIP):
   * Injects stockService via constructor.
   * @param {StockService} stockService
   */
  constructor(stockService = defaultStockService) {
    this.stockService = stockService;
  }

  getMovements = async (req, res, next) => {
    try {
      const result = await this.stockService.getMovements(req.query);

      res.status(200).json({
        success: true,
        data: result.movements,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  recordMovement = async (req, res, next) => {
    try {
      const result = await this.stockService.recordMovement(req.body, req.user.id);

      res.status(201).json({
        success: true,
        message: 'Stock movement recorded successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new StockController();