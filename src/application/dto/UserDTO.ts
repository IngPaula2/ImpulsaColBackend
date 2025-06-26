export interface UserDTO {
    id?: number;
    email: string;
    full_name: string;
    profile_image?: string;
    metadata?: UserMetadataDTO;
    notifications_enabled?: boolean;
    last_login?: Date;
    password_hash?: string;
}

export interface UserMetadataDTO {
    document_type?: string;
    document_number?: string;
    phone?: string;
    address?: string;
    city?: string;
    department?: string;
    country?: string;
    birth_date?: string;
}

export interface RegisterUserDTO {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    metadata?: UserMetadataDTO;
}

export interface LoginUserDTO {
    email: string;
    password: string;
}

export interface AuthResponseDTO {
    token: string;
    user: UserDTO;
} 