export interface ChatDTO {
    id: number;
    project_id?: number;
    user1_id?: number;
    user2_id?: number;
    created_at: Date;
    lastMessage?: MessageDTO;
    participants?: ChatParticipantDTO[];
}

export interface MessageDTO {
    id: number;
    chat_id: number;
    sender_id: number;
    content: string;
    sent_at: Date;
    sender?: ChatParticipantDTO;
}

export interface ChatParticipantDTO {
    id: number;
    full_name: string;
    profile_image?: string;
    email: string;
}

export interface CreateChatDTO {
    user1_id: number;
    user2_id: number;
    project_id?: number;
}

export interface CreateMessageDTO {
    chat_id: number;
    content: string;
}

export interface ChatSummaryDTO {
    id: number;
    otherParticipant: ChatParticipantDTO;
    lastMessage?: MessageDTO;
    created_at: Date;
    unreadCount?: number;
}

export interface GetChatMessagesDTO {
    chatId: number;
    limit?: number;
    offset?: number;
} 