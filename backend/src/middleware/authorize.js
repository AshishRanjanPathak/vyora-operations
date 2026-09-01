import { ForbiddenError, UnauthorizedError } from '../errors/AppError.js';

/**
 * Role-based authorization middleware.
 * Ensures the authenticated user has one of the allowed roles.
 * @param {string[]} allowedRoles - Array of roles permitted (e.g. ['ADMIN', 'SALES'])
 */
export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('User is not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access denied. Role '${req.user.role}' is not authorized for this resource.`
        )
      );
    }

    next();
  };
};