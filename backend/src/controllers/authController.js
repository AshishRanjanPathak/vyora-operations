import defaultAuthService, { AuthService } from '../services/authService.js';

export class AuthController {
  /**
   * Dependency Inversion Principle (DIP):
   * AuthController accepts authService via constructor.
   * @param {AuthService} authService
   */
  constructor(authService = defaultAuthService) {
    this.authService = authService;
  }

  // Use arrow function to preserve 'this' context when Express calls the method
  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const data = await this.authService.login({ email, password });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req, res, next) => {
    try {
      const user = await this.authService.getMe(req.user.id);

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new AuthController();