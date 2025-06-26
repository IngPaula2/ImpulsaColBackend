export interface IAuthenticatedUser {
    userId: number;
    email: string;
}

export interface IAuthenticatedRequest {
    user?: IAuthenticatedUser;
} 