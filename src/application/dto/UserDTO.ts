export interface UserDTO {
    id?: number;
    email: string;
    full_name: string;
    metadata?: UserMetadataDTO;
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