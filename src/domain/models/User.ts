export interface User {
    id?: number;
    email: string;
    password_hash?: string;
    full_name: string;
    profile_image?: string;
    entrepreneurships?: any[];
    investmentIdeas?: any[];
    metadata?: UserMetadata;
    created_at?: Date;
    notifications_enabled?: boolean;
    last_login?: Date;
}

export interface UserMetadata {
    document_type?: string;
    document_number?: string;
    phone?: string;
    address?: string;
    city?: string;
    department?: string;
    country?: string;
    birth_date?: Date;
    notifications_enabled?: boolean;
    last_login?: Date;
}

// Value Objects
export interface UserCredentials {
    email: string;
    password: string;
}

export interface UserRegistrationData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    metadata?: UserMetadata;
} 