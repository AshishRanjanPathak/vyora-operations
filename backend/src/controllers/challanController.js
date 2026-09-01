import defaultChallanService, { ChallanService } from '../services/challanService.js';

export class ChallanController {
  /**
   * Dependency Inversion Principle (DIP):
   * Injects challanService via constructor.
   * @param {ChallanService} challanService
   */
  constructor(challanService = defaultChallanService) {
    this.challanService = challanService;
  }

  getChallans = async (req, res, next) => {
    try {
      const result = await this.challanService.getChallans(req.query);

      res.status(200).json({
        success: true,
        data: result.challans,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getChallanById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const challan = await this.challanService.getChallanById(id);

      res.status(200).json({
        success: true,
        data: challan,
      });
    } catch (error) {
      next(error);
    }
  };

  createDraftChallan = async (req, res, next) => {
    try {
      const challan = await this.challanService.createDraftChallan(req.body, req.user.id);

      res.status(201).json({
        success: true,
        message: 'Draft challan created successfully',
        data: challan,
      });
    } catch (error) {
      next(error);
    }
  };

  confirmChallan = async (req, res, next) => {
    try {
      const { id } = req.params;
      const challan = await this.challanService.confirmChallan(id, req.user.id);

      res.status(200).json({
        success: true,
        message: `Challan #${challan.challanNumber} confirmed and stock updated`,
        data: challan,
      });
    } catch (error) {
      next(error);
    }
  };

  cancelChallan = async (req, res, next) => {
    try {
      const { id } = req.params;
      const challan = await this.challanService.cancelChallan(id, req.user.id);

      res.status(200).json({
        success: true,
        message: `Challan #${challan.challanNumber} cancelled successfully`,
        data: challan,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new ChallanController();