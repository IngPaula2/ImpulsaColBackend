import { DataSource, Repository } from 'typeorm';
import { IChatRepository } from '../../../domain/ports/IChatRepository';
import { Chat, Message, CreateChatData, CreateMessageData, ChatSummary, ChatParticipant } from '../../../domain/models/Chat';
import { ChatEntity } from '../entities/ChatEntity';
import { MessageEntity } from '../entities/MessageEntity';
import { UserEntity } from '../entities/UserEntity';

export class TypeORMChatRepository implements IChatRepository {
    private chatRepository: Repository<ChatEntity>;
    private messageRepository: Repository<MessageEntity>;
    private userRepository: Repository<UserEntity>;

    constructor(private readonly dataSource: DataSource) {
        this.chatRepository = dataSource.getRepository(ChatEntity);
        this.messageRepository = dataSource.getRepository(MessageEntity);
        this.userRepository = dataSource.getRepository(UserEntity);
    }

    async createChat(chatData: CreateChatData): Promise<Chat> {
        const chatEntity = this.chatRepository.create({
            user1_id: chatData.user1_id,
            user2_id: chatData.user2_id,
            project_id: chatData.project_id
        });

        const savedChat = await this.chatRepository.save(chatEntity);
        return this.mapChatToModel(savedChat);
    }

    async findChatById(id: number): Promise<Chat | null> {
        const chatEntity = await this.chatRepository.findOne({
            where: { id },
            relations: ['user1', 'user2', 'messages', 'messages.sender']
        });

        return chatEntity ? this.mapChatToModel(chatEntity) : null;
    }

    async findChatBetweenUsers(user1Id: number, user2Id: number): Promise<Chat | null> {
        const chatEntity = await this.chatRepository
            .createQueryBuilder('chat')
            .where(
                '(chat.user1_id = :user1Id AND chat.user2_id = :user2Id) OR (chat.user1_id = :user2Id AND chat.user2_id = :user1Id)',
                { user1Id, user2Id }
            )
            .leftJoinAndSelect('chat.user1', 'user1')
            .leftJoinAndSelect('chat.user2', 'user2')
            .getOne();

        return chatEntity ? this.mapChatToModel(chatEntity) : null;
    }

    async findUserChats(userId: number): Promise<ChatSummary[]> {
        const chatEntities = await this.chatRepository
            .createQueryBuilder('chat')
            .leftJoinAndSelect('chat.user1', 'user1')
            .leftJoinAndSelect('chat.user2', 'user2')
            .leftJoin('chat.messages', 'lastMessage')
            .leftJoinAndSelect('lastMessage.sender', 'lastMessageSender')
            .where('chat.user1_id = :userId OR chat.user2_id = :userId', { userId })
            .addSelect('lastMessage.id')
            .addSelect('lastMessage.content')
            .addSelect('lastMessage.sent_at')
            .orderBy('chat.created_at', 'DESC')
            .addOrderBy('lastMessage.sent_at', 'DESC')
            .getMany();

        return chatEntities.map(chat => this.mapChatToSummary(chat, userId));
    }

    async createMessage(messageData: CreateMessageData): Promise<Message> {
        const messageEntity = this.messageRepository.create({
            chat_id: messageData.chat_id,
            sender_id: messageData.sender_id,
            content: messageData.content
        });

        const savedMessage = await this.messageRepository.save(messageEntity);
        
        // Cargar el mensaje con las relaciones
        const messageWithRelations = await this.messageRepository.findOne({
            where: { id: savedMessage.id },
            relations: ['sender']
        });

        return this.mapMessageToModel(messageWithRelations!);
    }

    async findChatMessages(chatId: number, limit: number = 50, offset: number = 0): Promise<Message[]> {
        const messageEntities = await this.messageRepository.find({
            where: { chat_id: chatId },
            relations: ['sender'],
            order: { sent_at: 'DESC' },
            take: limit,
            skip: offset
        });

        return messageEntities.map(message => this.mapMessageToModel(message));
    }

    async findMessageById(id: number): Promise<Message | null> {
        const messageEntity = await this.messageRepository.findOne({
            where: { id },
            relations: ['sender', 'chat']
        });

        return messageEntity ? this.mapMessageToModel(messageEntity) : null;
    }

    async isChatParticipant(chatId: number, userId: number): Promise<boolean> {
        const chat = await this.chatRepository.findOne({
            where: { id: chatId }
        });

        if (!chat) return false;

        return chat.user1_id === userId || chat.user2_id === userId;
    }

    private mapChatToModel(entity: ChatEntity): Chat {
        return {
            id: entity.id,
            project_id: entity.project_id,
            user1_id: entity.user1_id,
            user2_id: entity.user2_id,
            created_at: entity.created_at,
            participants: this.mapParticipants([entity.user1, entity.user2]),
            lastMessage: entity.messages?.length > 0 ? this.mapMessageToModel(entity.messages[0]) : undefined
        };
    }

    private mapChatToSummary(entity: ChatEntity, currentUserId: number): ChatSummary {
        const otherUser = entity.user1_id === currentUserId ? entity.user2 : entity.user1;
        
        return {
            id: entity.id,
            otherParticipant: this.mapUserToParticipant(otherUser!),
            lastMessage: entity.messages?.length > 0 ? this.mapMessageToModel(entity.messages[0]) : undefined,
            created_at: entity.created_at,
            unreadCount: 0 // Por implementar si es necesario
        };
    }

    private mapMessageToModel(entity: MessageEntity): Message {
        return {
            id: entity.id,
            chat_id: entity.chat_id,
            sender_id: entity.sender_id,
            content: entity.content,
            sent_at: entity.sent_at,
            sender: entity.sender ? this.mapUserToParticipant(entity.sender) : undefined
        };
    }

    private mapParticipants(users: (UserEntity | undefined)[]): ChatParticipant[] {
        return users
            .filter((user): user is UserEntity => user !== undefined)
            .map(user => this.mapUserToParticipant(user));
    }

    private mapUserToParticipant(user: UserEntity): ChatParticipant {
        return {
            id: user.id,
            full_name: user.full_name,
            profile_image: user.profile_image,
            email: user.email
        };
    }
} 