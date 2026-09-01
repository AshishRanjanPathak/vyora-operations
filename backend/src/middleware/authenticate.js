import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import userRepository from '../repositories/userRepository.js';
import { UnauthorizedError } from '../errors/AppError.js';

export const authenticate = async (req, res, next) => {
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

    // Verify user still exists in database and is active
    const user = await userRepository.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User account not found or deactivated');
    }

    // Attach authenticated user payload to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};