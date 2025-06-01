import { Request, Response } from 'express';
import { UserApplicationService } from '../../application/UserApplicationService';
import { IAuthenticatedRequest } from '../../domain/interfaces/IAuthenticatedRequest';

export class UserController {
    constructor(private readonly userApplicationService: UserApplicationService) {}

    register = async (req: Request, res: Response): Promise<void> => {
        try {
            const userData = req.body;
            const user = await this.userApplicationService.register(userData);
            
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    // No devolvemos datos sensibles como password_hash
                }
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error registering user',
            });
        }
    };

    getProfile = async (req: Request & IAuthenticatedRequest, res: Response): Promise<void> => {
        try {
            if (!req.user?.userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            const user = await this.userApplicationService.getProfile(req.user.userId);
            
            // Excluir datos sensibles
            const { password_hash, ...safeUserData } = user;
            
            res.status(200).json({
                success: true,
                data: safeUserData
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error retrieving profile'
            });
        }
    };

    updateProfile = async (req: Request & IAuthenticatedRequest, res: Response): Promise<void> => {
        try {
            if (!req.user?.userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            const updatedUser = await this.userApplicationService.updateProfile(
                req.user.userId,
                req.body
            );

            // Excluir datos sensibles
            const { password_hash, ...safeUserData } = updatedUser;

            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: safeUserData
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error updating profile'
            });
        }
    };
} 