import { Chat, Message, CreateChatData, CreateMessageData, ChatSummary } from '../models/Chat';
import { IChatRepository } from '../ports/IChatRepository';

export class ChatDomainService {
    constructor(private readonly chatRepository: IChatRepository) {}

    async createOrGetChat(user1Id: number, user2Id: number, projectId?: number): Promise<Chat> {
        // Validaciones de dominio
        if (user1Id === user2Id) {
            throw new Error('Un usuario no puede chatear consigo mismo');
        }

        if (user1Id <= 0 || user2Id <= 0) {
            throw new Error('Los IDs de usuario deben ser válidos');
        }

        // Verificar si ya existe un chat entre estos usuarios
        const existingChat = await this.chatRepository.findChatBetweenUsers(user1Id, user2Id);
        
        if (existingChat) {
            return existingChat;
        }

        // Crear nuevo chat
        const chatData: CreateChatData = {
            user1_id: user1Id,
            user2_id: user2Id,
            project_id: projectId
        };

        return this.chatRepository.createChat(chatData);
    }

    async sendMessage(chatId: number, senderId: number, content: string): Promise<Message> {
        // Validaciones de dominio
        if (!content || content.trim().length === 0) {
            throw new Error('El mensaje no puede estar vacío');
        }

        if (content.length > 1000) {
            throw new Error('El mensaje no puede exceder 1000 caracteres');
        }

        // Verificar que el usuario sea participante del chat
        const isParticipant = await this.chatRepository.isChatParticipant(chatId, senderId);
        if (!isParticipant) {
            throw new Error('No tienes permisos para enviar mensajes en este chat');
        }

        const messageData: CreateMessageData = {
            chat_id: chatId,
            sender_id: senderId,
            content: content.trim()
        };

        return this.chatRepository.createMessage(messageData);
    }

    async getChatById(chatId: number, userId: number): Promise<Chat | null> {
        if (chatId <= 0) {
            throw new Error('ID de chat inválido');
        }

        const chat = await this.chatRepository.findChatById(chatId);
        
        if (!chat) {
            return null;
        }

        // Verificar que el usuario sea participante del chat
        const isParticipant = await this.chatRepository.isChatParticipant(chatId, userId);
        if (!isParticipant) {
            throw new Error('No tienes permisos para acceder a este chat');
        }

        return chat;
    }

    async getUserChats(userId: number): Promise<ChatSummary[]> {
        if (userId <= 0) {
            throw new Error('ID de usuario inválido');
        }

        return this.chatRepository.findUserChats(userId);
    }

    async getChatMessages(chatId: number, userId: number, limit?: number, offset?: number): Promise<Message[]> {
        if (chatId <= 0) {
            throw new Error('ID de chat inválido');
        }

        // Verificar que el usuario sea participante del chat
        const isParticipant = await this.chatRepository.isChatParticipant(chatId, userId);
        if (!isParticipant) {
            throw new Error('No tienes permisos para acceder a los mensajes de este chat');
        }

        // Validar límites
        const validLimit = Math.min(limit || 50, 100); // máximo 100 mensajes por petición
        const validOffset = Math.max(offset || 0, 0);

        return this.chatRepository.findChatMessages(chatId, validLimit, validOffset);
    }
} 