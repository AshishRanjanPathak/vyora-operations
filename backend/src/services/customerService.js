import defaultCustomerRepository from '../repositories/customerRepository.js';
import { NotFoundError } from '../errors/AppError.js';

export class CustomerService {
  /**
   * Dependency Inversion Principle (DIP):
   * Injects customer repository via constructor with default fallback.
   * @param {typeof defaultCustomerRepository} customerRepo
   */
  constructor(customerRepo = defaultCustomerRepository) {
    this.customerRepo = customerRepo;
  }

  async getCustomers(query) {
    const { page = 1, limit = 10, search, status, customerType } = query;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (customerType) {
      where.customerType = customerType;
    }

    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { businessName: { contains: searchTerm, mode: 'insensitive' } },
        { mobile: { contains: searchTerm } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;
    const take = limit;

    const [customers, total] = await Promise.all([
      this.customerRepo.findMany({ where, skip, take }),
      this.customerRepo.count(where),
    ]);

    return {
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getCustomerById(id) {
    const customer = await this.customerRepo.findById(id);
    if (!customer) {
      throw new NotFoundError(`Customer with ID '${id}' not found`);
    }
    return customer;
  }

  async createCustomer(data, userId) {
    const customerData = {
      name: data.name.trim(),
      mobile: data.mobile.trim(),
      email: data.email ? data.email.trim().toLowerCase() : null,
      businessName: data.businessName.trim(),
      gstNumber: data.gstNumber ? data.gstNumber.trim().toUpperCase() : null,
      customerType: data.customerType,
      status: data.status || 'LEAD',
      address: data.address ? data.address.trim() : null,
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
      notes: data.notes ? data.notes.trim() : null,
      createdById: userId,
    };

    return this.customerRepo.create(customerData);
  }

  async updateCustomer(id, data) {
    await this.getCustomerById(id); // Throws NotFoundError if not exists

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.mobile !== undefined) updateData.mobile = data.mobile.trim();
    if (data.email !== undefined) updateData.email = data.email ? data.email.trim().toLowerCase() : null;
    if (data.businessName !== undefined) updateData.businessName = data.businessName.trim();
    if (data.gstNumber !== undefined) updateData.gstNumber = data.gstNumber ? data.gstNumber.trim().toUpperCase() : null;
    if (data.customerType !== undefined) updateData.customerType = data.customerType;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.address !== undefined) updateData.address = data.address ? data.address.trim() : null;
    if (data.followUpDate !== undefined) updateData.followUpDate = data.followUpDate ? new Date(data.followUpDate) : null;
    if (data.notes !== undefined) updateData.notes = data.notes ? data.notes.trim() : null;

    return this.customerRepo.update(id, updateData);
  }

  async deleteCustomer(id) {
    await this.getCustomerById(id); // Throws NotFoundError if not exists
    return this.customerRepo.delete(id);
  }

  async addFollowUp(customerId, data, userId) {
    await this.getCustomerById(customerId); // Verify customer exists

    const followUp = await this.customerRepo.createFollowUp({
      customerId,
      note: data.note.trim(),
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
      createdById: userId,
    });

    // If followUpDate was provided, update the customer's scheduled follow-up date as well
    if (data.followUpDate) {
      await this.customerRepo.update(customerId, {
        followUpDate: new Date(data.followUpDate),
      });
    }

    return followUp;
  }
}

export default new CustomerService();