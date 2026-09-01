import defaultDashboardService, { DashboardService } from '../services/dashboardService.js';

export class DashboardController {
  constructor(dashboardService = defaultDashboardService) {
    this.dashboardService = dashboardService;
  }

  getStats = async (req, res, next) => {
    try {
      const stats = await this.dashboardService.getStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new DashboardController();