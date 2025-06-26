import { Chat, Message, CreateChatData, CreateMessageData, ChatSummary } from '../models/Chat';

export interface IChatRepository {
    // Chat operations
    createChat(chatData: CreateChatData): Promise<Chat>;
    findChatById(id: number): Promise<Chat | null>;
    findChatBetweenUsers(user1Id: number, user2Id: number): Promise<Chat | null>;
    findUserChats(userId: number): Promise<ChatSummary[]>;
    
    // Message operations
    createMessage(messageData: CreateMessageData): Promise<Message>;
    findChatMessages(chatId: number, limit?: number, offset?: number): Promise<Message[]>;
    findMessageById(id: number): Promise<Message | null>;
    
    // Utility operations
    isChatParticipant(chatId: number, userId: number): Promise<boolean>;
} 