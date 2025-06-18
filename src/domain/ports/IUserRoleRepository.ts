export interface IUserRoleRepository {
  assignRoleToUser(userId: number, roleName: string): Promise<void>;
  getUserRoles(userId: number): Promise<string[]>;
} 