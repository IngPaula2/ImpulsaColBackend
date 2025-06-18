import { IUserRoleRepository } from '../../domain/ports/IUserRoleRepository';

export class UserRoleService {
  constructor(private readonly userRoleRepository: IUserRoleRepository) {}

  async assignRoleToUser(userId: number, roleName: string): Promise<void> {
    await this.userRoleRepository.assignRoleToUser(userId, roleName);
  }

  async getUserRoles(userId: number): Promise<string[]> {
    return this.userRoleRepository.getUserRoles(userId);
  }
} 