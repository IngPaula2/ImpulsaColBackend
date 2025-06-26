import { Request, Response } from 'express';
import { ChatApplicationService } from '../../../application/services/ChatApplicationService';
import { CreateChatDTO, CreateMessageDTO, GetChatMessagesDTO } from '../../../application/dto/ChatDTO';

// Interfaz local para request autenticado
interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

export class ChatController {
    constructor(private readonly chatApplicationService: ChatApplicationService) {}

    // GET /api/chats - Obtener todos los chats del usuario
    getUserChats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }

            const chats = await this.chatApplicationService.getUserChats(userId);
            
            res.status(200).json({
                success: true,
                message: 'Chats obtenidos exitosamente',
                data: chats
            });
        } catch (error) {
            console.error('Error al obtener chats del usuario:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    };

    // POST /api/chats - Crear o obtener un chat existente
    createOrGetChat = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }

            const { user2_id, project_id } = req.body;

            if (!user2_id) {
                res.status(400).json({
                    success: false,
                    message: 'ID del segundo usuario es requerido'
                });
                return;
            }

            const createChatData: CreateChatDTO = {
                user1_id: userId,
                user2_id: parseInt(user2_id),
                project_id: project_id ? parseInt(project_id) : undefined
            };

            const chat = await this.chatApplicationService.createOrGetChat(createChatData);

            res.status(201).json({
                success: true,
                message: 'Chat creado/obtenido exitosamente',
                data: chat
            });
        } catch (error) {
            console.error('Error al crear/obtener chat:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al crear el chat'
            });
        }
    };

    // GET /api/chats/:id - Obtener un chat específico
    getChatById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }

            const chatId = parseInt(req.params.id);
            if (isNaN(chatId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID de chat inválido'
                });
                return;
            }

            const chat = await this.chatApplicationService.getChatById(chatId, userId);

            if (!chat) {
                res.status(404).json({
                    success: false,
                    message: 'Chat no encontrado'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Chat obtenido exitosamente',
                data: chat
            });
        } catch (error) {
            console.error('Error al obtener chat:', error);
            res.status(403).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al obtener el chat'
            });
        }
    };

    // GET /api/chats/:id/messages - Obtener mensajes de un chat
    getChatMessages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }

            const chatId = parseInt(req.params.id);
            if (isNaN(chatId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID de chat inválido'
                });
                return;
            }

            const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
            const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;

            const messagesData: GetChatMessagesDTO = {
                chatId,
                limit,
                offset
            };

            const messages = await this.chatApplicationService.getChatMessages(userId, messagesData);

            res.status(200).json({
                success: true,
                message: 'Mensajes obtenidos exitosamente',
                data: messages
            });
        } catch (error) {
            console.error('Error al obtener mensajes:', error);
            res.status(403).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al obtener los mensajes'
            });
        }
    };

    // POST /api/chats/:id/messages - Enviar un mensaje
    sendMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
                return;
            }

            const chatId = parseInt(req.params.id);
            if (isNaN(chatId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID de chat inválido'
                });
                return;
            }

            const { content } = req.body;
            if (!content) {
                res.status(400).json({
                    success: false,
                    message: 'El contenido del mensaje es requerido'
                });
                return;
            }

            const messageData: CreateMessageDTO = {
                chat_id: chatId,
                content
            };

            const message = await this.chatApplicationService.sendMessage(userId, messageData);

            res.status(201).json({
                success: true,
                message: 'Mensaje enviado exitosamente',
                data: message
            });
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al enviar el mensaje'
            });
        }
    };
} 