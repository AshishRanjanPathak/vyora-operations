import defaultAuthService, { AuthService } from '../services/authService.js';

export class AuthController {
  constructor(authService = defaultAuthService) {
    this.authService = authService;
  }

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

  register = async (req, res, next) => {
    try {
      const { name, email, password, role } = req.body;
      const data = await this.authService.register({ name, email, password, role });

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await this.authService.changePassword(req.user.id, {
        currentPassword,
        newPassword,
      });

      res.status(200).json({
        success: true,
        message: result.message,
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