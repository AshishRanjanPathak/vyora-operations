import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import userRepository from '../repositories/userRepository.js';
import { UnauthorizedError, NotFoundError, ValidationError } from '../errors/AppError.js';

export class AuthService {
  /**
   * Dependency Inversion Principle (DIP):
   * AuthService accepts its repository dependency via constructor.
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

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      env.jwtSecret,
      { expiresIn: '7d' }
    );

    const { password: _, ...safeUser } = user;

    return {
      user: safeUser,
      token,
    };
  }

  async register({ name, email, password, role = 'ADMIN' }) {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      throw new ValidationError('A user with this corporate email address already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await this.userRepo.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      env.jwtSecret,
      { expiresIn: '7d' }
    );

    return {
      user: newUser,
      token,
    };
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    const fullUser = await this.userRepo.findByEmail(
      (await this.userRepo.findById(userId))?.email
    );

    if (!fullUser) {
      throw new NotFoundError('User not found');
    }

    const isMatch = await bcrypt.compare(currentPassword, fullUser.password);
    if (!isMatch) {
      throw new ValidationError('Current password entered is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepo.update(userId, { password: hashedPassword });

    return { message: 'Password updated successfully' };
  }

  async getMe(userId) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }
    return user;
  }
}

export default new AuthService();