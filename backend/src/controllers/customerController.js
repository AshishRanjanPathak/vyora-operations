import defaultCustomerService, { CustomerService } from '../services/customerService.js';

export class CustomerController {
  /**
   * Dependency Inversion Principle (DIP):
   * Injects customer service via constructor with default fallback.
   * @param {CustomerService} customerService
   */
  constructor(customerService = defaultCustomerService) {
    this.customerService = customerService;
  }

  getCustomers = async (req, res, next) => {
    try {
      const result = await this.customerService.getCustomers(req.query);

      res.status(200).json({
        success: true,
        data: result.customers,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getCustomerById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const customer = await this.customerService.getCustomerById(id);

      res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  };

  createCustomer = async (req, res, next) => {
    try {
      const customer = await this.customerService.createCustomer(req.body, req.user.id);

      res.status(201).json({
        success: true,
        message: 'Customer created successfully',
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  };

  updateCustomer = async (req, res, next) => {
    try {
      const { id } = req.params;
      const customer = await this.customerService.updateCustomer(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Customer updated successfully',
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteCustomer = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.customerService.deleteCustomer(id);

      res.status(200).json({
        success: true,
        message: 'Customer deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  addFollowUp = async (req, res, next) => {
    try {
      const { id } = req.params;
      const followUp = await this.customerService.addFollowUp(id, req.body, req.user.id);

      res.status(201).json({
        success: true,
        message: 'Follow-up added successfully',
        data: followUp,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new CustomerController();