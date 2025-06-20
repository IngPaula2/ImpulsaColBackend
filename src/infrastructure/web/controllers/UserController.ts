import { Request, Response } from 'express';
import { UserApplicationService } from '../../../application/services/UserService';
import { RegisterUserDTO, LoginUserDTO } from '../../../application/dto/UserDTO';
import { UserRoleService } from '../../../application/services/UserRoleService';
import { IUserRoleRepository } from '../../../domain/ports/IUserRoleRepository';

// Interfaz local para request autenticado
interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

export class UserController {
    constructor(
      private readonly userService: UserApplicationService,
      private readonly userRoleService: UserRoleService
    ) {}

    register = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.body.firstName || !req.body.lastName) {
                throw new Error('Se requiere nombre y apellido');
            }

            const registerData: RegisterUserDTO = {
                email: req.body.email,
                password: req.body.password,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                metadata: req.body.metadata
            };

            const result = await this.userService.register(registerData);
            // Asignar rol por defecto
            await this.userRoleService.assignRoleToUser(result.user.id!, 'UsuarioGeneral');
            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                data: result
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error en el registro'
            });
        }
    };

    login = async (req: Request, res: Response): Promise<void> => {
        try {
            const loginData: LoginUserDTO = {
                email: req.body.email,
                password: req.body.password
            };

            const result = await this.userService.login(loginData);
            
            res.status(200).json({
                success: true,
                message: 'Login exitoso',
                data: result
            });
        } catch (error) {
            res.status(401).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error en la autenticación'
            });
        }
    };

    assignRole = async (req: Request, res: Response): Promise<void> => {
      try {
        const userId = parseInt(req.params.id);
        const { roleName } = req.body;
        if (!userId || !roleName) throw new Error('Faltan parámetros');
        await this.userRoleService.assignRoleToUser(userId, roleName);
        res.status(200).json({ success: true, message: 'Rol asignado correctamente' });
      } catch (error) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Error al asignar rol' });
      }
    };

    // Nuevo: obtener perfil del usuario autenticado
    getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
        const userId = req.user?.userId;
        if (!userId) {
          res.status(400).json({ message: 'No se encontró el ID de usuario en el token' });
          return;
        }

        const user = await this.userService.findById(userId);
        if (!user) {
          res.status(404).json({ message: 'Usuario no encontrado' });
          return;
        }

        const roles = await this.userRoleService.getUserRoles(userId);

        const userProfile = {
          ...user,
          roles,
        };

        res.json({ success: true, data: userProfile });
      } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
      }
    };

    // Nuevo: actualizar perfil del usuario autenticado
    updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
        const userId = req.user?.userId;
        if (!userId) {
          res.status(400).json({ message: 'No se encontró el ID de usuario en el token' });
          return;
        }
        
        const updateData = req.body;

        const updatedUser = await this.userService.update(userId, updateData);
        res.json({ success: true, data: updatedUser });
      } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
      }
    };

    // Obtener estado de notificaciones
    getNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
        const userId = req.user?.userId;
        if (!userId) throw new Error('No autenticado');
        const user = await this.userService.findById(userId);
        if (!user) throw new Error('Usuario no encontrado');
        res.status(200).json({ success: true, data: { notifications_enabled: user.notifications_enabled ?? false } });
      } catch (error) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Error' });
      }
    };

    // Actualizar estado de notificaciones
    updateNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
        const userId = req.user?.userId;
        if (!userId) throw new Error('No autenticado');
        const { enabled } = req.body;
        if (typeof enabled !== 'boolean') throw new Error('Valor inválido');
        const updated = await this.userService.update(userId, { notifications_enabled: enabled });
        res.status(200).json({ success: true, data: { notifications_enabled: updated.notifications_enabled } });
      } catch (error) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Error' });
      }
    };

    // Cambiar contraseña
    changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
        const userId = req.user?.userId;
        if (!userId) throw new Error('No autenticado');
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) throw new Error('Datos incompletos');
        // Validar contraseña actual
        const user = await this.userService.findById(userId);
        if (!user) throw new Error('Usuario no encontrado');
        const isValid = await this.userService.comparePasswords(currentPassword, user.password_hash || '');
        if (!isValid) throw new Error('Contraseña actual incorrecta');
        // Validar nueva contraseña (mínimo 8 caracteres, etc.)
        if (newPassword.length < 8) throw new Error('La nueva contraseña debe tener al menos 8 caracteres');
        // Actualizar contraseña
        const password_hash = await this.userService.hashPassword(newPassword);
        await this.userService.update(userId, { password_hash });
        res.status(200).json({ success: true, message: 'Contraseña actualizada correctamente' });
      } catch (error) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Error' });
      }
    };
} 