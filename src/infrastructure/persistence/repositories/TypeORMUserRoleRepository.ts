import { IUserRoleRepository } from '../../../domain/ports/IUserRoleRepository';
import { DataSource } from 'typeorm';

export class TypeORMUserRoleRepository implements IUserRoleRepository {
  constructor(private readonly dataSource: DataSource) {}

  async assignRoleToUser(userId: number, roleName: string): Promise<void> {
    // Buscar el id del rol por nombre
    const role = await this.dataSource.query('SELECT id FROM roles WHERE name = $1', [roleName]);
    if (!role[0]) throw new Error('Rol no encontrado');
    const roleId = role[0].id;
    // Verificar si ya tiene el rol
    const exists = await this.dataSource.query('SELECT 1 FROM user_roles WHERE user_id = $1 AND role_id = $2', [userId, roleId]);
    if (exists.length === 0) {
      await this.dataSource.query('INSERT INTO user_roles (user_id, role_id, assigned_at) VALUES ($1, $2, NOW())', [userId, roleId]);
    }
  }

  async getUserRoles(userId: number): Promise<string[]> {
    const result = await this.dataSource.query(
      `SELECT r.name FROM roles r
       INNER JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = $1`,
      [userId]
    );
    return result.map((row: any) => row.name);
  }
} 