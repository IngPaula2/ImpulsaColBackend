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
          profile_image: user.profile_image || null,
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

    // Obtener perfil público de un usuario por ID
    getPublicProfile = async (req: Request, res: Response) => {
      try {
        const userId = Number(req.params.userId);
        if (isNaN(userId)) {
          return res.status(400).json({ success: false, message: 'ID inválido' });
        }
        const user = await this.userService.findPublicProfileById(userId);
        if (!user) {
          return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        res.json({ success: true, data: user });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener el perfil público' });
      }
    };

    // Subir imagen de perfil
    uploadProfileImage = async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.user?.userId;
        console.log('uploadProfileImage - userId:', userId);
        console.log('uploadProfileImage - req.method:', req.method);
        console.log('uploadProfileImage - req.headers:', req.headers);
        console.log('uploadProfileImage - req.file:', req.file);
        if (req.file) {
          console.log('uploadProfileImage - req.file typeof:', typeof req.file);
          if (typeof req.file === 'object') {
            Object.entries(req.file as Record<string, any>).forEach(([key, value]) => {
              console.log(`uploadProfileImage - req.file[${key}]:`, value);
            });
          }
        }
        console.log('uploadProfileImage - req.body:', req.body);
        if (!userId) return res.status(401).json({ success: false, message: 'No autenticado' });
        if (!req.file || !('path' in req.file)) {
          console.error('uploadProfileImage - No se subió ninguna imagen o req.file.path no existe');
          return res.status(400).json({ success: false, message: 'No se subió ninguna imagen', reqFile: req.file });
        }
        const imageUrl = (req.file as any).path;
        const updatedUser = await this.userService.update(userId, { profile_image: imageUrl });
        res.json({ success: true, data: { profile_image: updatedUser.profile_image } });
      } catch (error) {
        console.error('uploadProfileImage - Error:', error);
        res.status(500).json({ success: false, message: 'Error al subir la imagen de perfil', error: error instanceof Error ? error.message : error });
      }
    };

    // Solicitar recuperación de contraseña
    requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
      try {
        const { email } = req.body;
        if (!email) {
          res.status(400).json({ success: false, message: 'El email es requerido' });
          return;
        }

        await this.userService.requestPasswordReset(email);
        res.status(200).json({ 
          success: true, 
          message: 'Se ha enviado un código de recuperación a tu correo electrónico' 
        });
      } catch (error) {
        res.status(400).json({ 
          success: false, 
          message: error instanceof Error ? error.message : 'Error al solicitar recuperación de contraseña' 
        });
      }
    };

    // Verificar código de recuperación
    verifyPasswordResetCode = async (req: Request, res: Response): Promise<void> => {
      try {
        const { email, code } = req.body;
        if (!email || !code) {
          res.status(400).json({ success: false, message: 'Email y código son requeridos' });
          return;
        }

        const isValid = await this.userService.verifyPasswordResetCode(email, code);
        if (isValid) {
          res.status(200).json({ success: true, message: 'Código válido' });
        } else {
          res.status(400).json({ success: false, message: 'Código inválido o expirado' });
        }
      } catch (error) {
        res.status(400).json({ 
          success: false, 
          message: error instanceof Error ? error.message : 'Error al verificar código' 
        });
      }
    };

    // Restablecer contraseña
    resetPassword = async (req: Request, res: Response): Promise<void> => {
      try {
        const { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword) {
          res.status(400).json({ success: false, message: 'Email, código y nueva contraseña son requeridos' });
          return;
        }

        // Validar nueva contraseña
        if (newPassword.length < 8) {
          res.status(400).json({ success: false, message: 'La nueva contraseña debe tener al menos 8 caracteres' });
          return;
        }

        await this.userService.resetPassword(email, code, newPassword);
        res.status(200).json({ success: true, message: 'Contraseña restablecida correctamente' });
      } catch (error) {
        res.status(400).json({ 
          success: false, 
          message: error instanceof Error ? error.message : 'Error al restablecer contraseña' 
        });
      }
    };
} 