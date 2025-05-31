import { Request, Response } from 'express';
import { UserApplicationService } from '../../application/UserApplicationService';

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
} 