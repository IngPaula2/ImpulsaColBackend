export interface User {
    id?: string;
    name: string;
    email: string;
    password: string;     
    role?: string;        
    registrationDate?: Date; 
    status?: boolean;       
}
