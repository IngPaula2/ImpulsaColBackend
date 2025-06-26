import { ChatDomainService } from '../../domain/services/ChatDomainService';
import { 
    ChatDTO, 
    MessageDTO, 
    CreateChatDTO, 
    CreateMessageDTO, 
    ChatSummaryDTO,
    ChatParticipantDTO,
    GetChatMessagesDTO 
} from '../dto/ChatDTO';
import { Chat, Message, ChatSummary, ChatParticipant } from '../../domain/models/Chat';
import { NotificationApplicationService } from './NotificationApplicationService';

export class ChatApplicationService {
    constructor(
        private readonly chatDomainService: ChatDomainService,
        private readonly notificationService?: NotificationApplicationService
    ) {}

    async createOrGetChat(createChatData: CreateChatDTO): Promise<ChatDTO> {
        try {
            const chat = await this.chatDomainService.createOrGetChat(
                createChatData.user1_id,
                createChatData.user2_id,
                createChatData.project_id
            );

            return this.mapChatToDTO(chat);
        } catch (error) {
            throw error;
        }
    }

    async sendMessage(senderId: number, messageData: CreateMessageDTO): Promise<MessageDTO> {
        try {
            const message = await this.chatDomainService.sendMessage(
                messageData.chat_id,
                senderId,
                messageData.content
            );

            // Crear notificación para el receptor del mensaje
            await this.createMessageNotification(senderId, messageData.chat_id, message);

            return this.mapMessageToDTO(message);
        } catch (error) {
            throw error;
        }
    }

    async getChatById(chatId: number, userId: number): Promise<ChatDTO | null> {
        try {
            const chat = await this.chatDomainService.getChatById(chatId, userId);
            return chat ? this.mapChatToDTO(chat) : null;
        } catch (error) {
            throw error;
        }
    }

    async getUserChats(userId: number): Promise<ChatSummaryDTO[]> {
        try {
            const chats = await this.chatDomainService.getUserChats(userId);
            return chats.map(chat => this.mapChatSummaryToDTO(chat));
        } catch (error) {
            throw error;
        }
    }

    async getChatMessages(userId: number, messagesData: GetChatMessagesDTO): Promise<MessageDTO[]> {
        try {
            const messages = await this.chatDomainService.getChatMessages(
                messagesData.chatId,
                userId,
                messagesData.limit,
                messagesData.offset
            );

            return messages.map(message => this.mapMessageToDTO(message));
        } catch (error) {
            throw error;
        }
    }

    private mapChatToDTO(chat: Chat): ChatDTO {
        return {
            id: chat.id!,
            project_id: chat.project_id,
            user1_id: chat.user1_id,
            user2_id: chat.user2_id,
            created_at: chat.created_at!,
            lastMessage: chat.lastMessage ? this.mapMessageToDTO(chat.lastMessage) : undefined,
            participants: chat.participants?.map(p => this.mapParticipantToDTO(p))
        };
    }

    private mapMessageToDTO(message: Message): MessageDTO {
        return {
            id: message.id!,
            chat_id: message.chat_id,
            sender_id: message.sender_id,
            content: message.content,
            sent_at: message.sent_at!,
            sender: message.sender ? this.mapParticipantToDTO(message.sender) : undefined
        };
    }

    private mapChatSummaryToDTO(chatSummary: ChatSummary): ChatSummaryDTO {
        return {
            id: chatSummary.id,
            otherParticipant: this.mapParticipantToDTO(chatSummary.otherParticipant),
            lastMessage: chatSummary.lastMessage ? this.mapMessageToDTO(chatSummary.lastMessage) : undefined,
            created_at: chatSummary.created_at,
            unreadCount: chatSummary.unreadCount
        };
    }

    private mapParticipantToDTO(participant: ChatParticipant): ChatParticipantDTO {
        return {
            id: participant.id,
            full_name: participant.full_name,
            profile_image: participant.profile_image,
            email: participant.email
        };
    }

    private async createMessageNotification(senderId: number, chatId: number, message: Message): Promise<void> {
        if (!this.notificationService) {
            console.log('ChatApp - NotificationService no disponible');
            return;
        }

        try {
            console.log('ChatApp - Creando notificación de mensaje para chat:', chatId);
            
            // Obtener información del chat para determinar el receptor
            const chat = await this.chatDomainService.getChatById(chatId, senderId);
            
            if (!chat) {
                console.error('ChatApp - No se encontró el chat:', chatId);
                return;
            }

            // Determinar quién es el receptor (el usuario que no es el sender)
            const receiverId = chat.user1_id === senderId ? chat.user2_id : chat.user1_id;
            
            console.log('ChatApp - Datos del chat:', {
                chatId,
                senderId,
                receiverId,
                user1_id: chat.user1_id,
                user2_id: chat.user2_id
            });
            
            // Validar que el receptor existe
            if (!receiverId || receiverId === senderId) {
                console.error('ChatApp - Receptor inválido:', { receiverId, senderId });
                return;
            }
            
            // Obtener información del remitente desde el mensaje
            const senderName = message.sender?.full_name || 'Un usuario';
            const senderImage = message.sender?.profile_image;

            console.log('ChatApp - Datos del remitente:', {
                senderId,
                senderName,
                senderImage: senderImage ? 'Imagen disponible' : 'Sin imagen'
            });

            // Crear la notificación
            const result = await this.notificationService.createMessageNotification(
                receiverId,
                senderId,
                senderName,
                chatId,
                senderImage
            );

            if (result.success) {
                // Verificar que data existe y es un objeto individual (no array)
                if (result.data && !Array.isArray(result.data)) {
                    console.log('ChatApp - Notificación de mensaje creada exitosamente:', result.data.id);
                } else {
                    console.log('ChatApp - Notificación de mensaje creada exitosamente');
                }
            } else {
                console.error('ChatApp - Error al crear notificación:', result.message);
            }
        } catch (error) {
            console.error('ChatApp - Error al crear notificación de mensaje:', error);
            // No lanzar error para no afectar el flujo principal
        }
    }
} 