import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import defaultUserRepository from '../repositories/userRepository.js';
import { UnauthorizedError } from '../errors/AppError.js';

/**
 * Factory function to create authentication middleware with injectable repository.
 * @param {typeof defaultUserRepository} userRepo
 */
export const createAuthenticateMiddleware = (userRepo = defaultUserRepository) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('Authentication token missing or invalid');
      }

      const token = authHeader.split(' ')[1];

      let decoded;
      try {
        decoded = jwt.verify(token, env.jwtSecret);
      } catch (jwtError) {
        if (jwtError.name === 'TokenExpiredError') {
          throw new UnauthorizedError('Token has expired. Please log in again.');
        }
        throw new UnauthorizedError('Invalid token signature');
      }

      const user = await userRepo.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new UnauthorizedError('User account not found or deactivated');
      }

      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Default pre-configured instance for routing
export const authenticate = createAuthenticateMiddleware();