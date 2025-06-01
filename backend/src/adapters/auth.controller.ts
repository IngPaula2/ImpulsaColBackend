import { Request, Response } from 'express';
import { AuthService } from '../application/auth.service';

const authService = new AuthService();

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({ message: 'Usuario registrado exitosamente', user });
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Error al registrar usuario' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await authService.login(email, password);
      if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });
      res.json({ message: 'Inicio de sesión exitoso', user });
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Error al iniciar sesión' });
    }
  }
} 