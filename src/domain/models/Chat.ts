export interface Chat {
    id?: number;
    project_id?: number;
    user1_id?: number;
    user2_id?: number;
    created_at?: Date;
    lastMessage?: Message;
    participants?: ChatParticipant[];
}

export interface Message {
    id?: number;
    chat_id: number;
    sender_id: number;
    content: string;
    sent_at?: Date;
    sender?: ChatParticipant;
}

export interface ChatParticipant {
    id: number;
    full_name: string;
    profile_image?: string;
    email: string;
}

export interface CreateChatData {
    user1_id: number;
    user2_id: number;
    project_id?: number;
}

export interface CreateMessageData {
    chat_id: number;
    sender_id: number;
    content: string;
}

export interface ChatSummary {
    id: number;
    otherParticipant: ChatParticipant;
    lastMessage?: Message;
    created_at: Date;
    unreadCount?: number;
} 