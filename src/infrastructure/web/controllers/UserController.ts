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
            console.error('Error en registro:', error instanceof Error ? error.message : 'Error desconocido');
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
            console.error('Error en login:', error instanceof Error ? error.message : 'Error desconocido');
            
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
        console.log('UserController.getProfile - Iniciando obtención de perfil');
        console.log('UserController.getProfile - Request user:', req.user);
        
        // El userId debe estar en req.user.userId (middleware de autenticación)
        const userId = req.user?.userId;
        if (!userId) {
          console.log('UserController.getProfile - No se encontró userId en request');
          throw new Error('No autenticado');
        }

        console.log('UserController.getProfile - Obteniendo datos del usuario con ID:', userId);
        // Obtener datos del usuario
        const user = await this.userService.findById(userId);
        if (!user) {
          console.log('UserController.getProfile - Usuario no encontrado');
          throw new Error('Usuario no encontrado');
        }

        console.log('UserController.getProfile - Obteniendo roles del usuario');
        // Obtener roles
        const roles = await this.userRoleService.getUserRoles(userId);
        console.log('UserController.getProfile - Roles obtenidos:', roles);

        res.status(200).json({
          success: true,
          data: {
            ...user,
            roles
          }
        });
      } catch (error) {
        console.error('UserController.getProfile - Error:', error);
        res.status(401).json({ 
          success: false, 
          message: error instanceof Error ? error.message : 'No autenticado' 
        });
      }
    };

    // Nuevo: actualizar perfil del usuario autenticado
    updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
        console.log('UserController.updateProfile - Iniciando actualización de perfil');
        console.log('UserController.updateProfile - Request user:', req.user);
        console.log('UserController.updateProfile - Request body:', req.body);
        
        const userId = req.user?.userId;
        if (!userId) {
          console.log('UserController.updateProfile - No se encontró userId en request');
          throw new Error('No autenticado');
        }
        
        console.log('UserController.updateProfile - Actualizando usuario con ID:', userId);
        const updateData = req.body;

        // Validar el teléfono igual que en el registro
        if (updateData.metadata?.phone) {
          console.log('UserController.updateProfile - Validando teléfono:', updateData.metadata.phone);
          const cleanPhone = updateData.metadata.phone.replace(/\s|-/g, '');
          if (!/^3\d{9}$/.test(cleanPhone)) {
            throw new Error('El número de teléfono debe comenzar con 3 y tener 10 dígitos');
          }
          updateData.metadata.phone = cleanPhone;
          console.log('UserController.updateProfile - Teléfono validado y limpiado:', cleanPhone);
        }

        // Llama al servicio de aplicación para actualizar
        console.log('UserController.updateProfile - Llamando al servicio de aplicación');
        const updatedUser = await this.userService.update(userId, updateData);
        console.log('UserController.updateProfile - Usuario actualizado exitosamente');
        res.status(200).json({ success: true, data: updatedUser });
      } catch (error) {
        console.error('UserController.updateProfile - Error:', error);
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Error al actualizar' });
      }
    };

    // Obtener estado de notificaciones
    getNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
        const userId = req.user?.userId;
        if (!userId) throw new Error('No autenticado');
        const user = await this.userService.findById(userId);
        if (!user) throw new Error('Usuario no encontrado');
        res.status(200).json({ success: true, notifications_enabled: user.notifications_enabled ?? false });
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
        res.status(200).json({ success: true, notifications_enabled: updated.notifications_enabled });
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