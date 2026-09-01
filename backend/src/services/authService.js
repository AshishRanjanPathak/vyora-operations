import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import userRepository from '../repositories/userRepository.js';
import { UnauthorizedError, NotFoundError } from '../errors/AppError.js';

export class AuthService {
  /**
   * Dependency Inversion Principle (DIP):
   * AuthService accepts its repository dependency via constructor.
   * Defaults to the Prisma userRepository, but allows injecting mocks for testing.
   * @param {typeof userRepository} userRepo
   */
  constructor(userRepo = userRepository) {
    this.userRepo = userRepo;
  }

  async login({ email, password }) {
    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Your account has been deactivated. Please contact an admin.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      env.jwtSecret,
      { expiresIn: '7d' }
    );

    // Return safe user object (omit password)
    const { password: _, ...safeUser } = user;

    return {
      user: safeUser,
      token,
    };
  }

  async getMe(userId) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }
    return user;
  }
}

// Export default instance configured with production repository
export default new AuthService();