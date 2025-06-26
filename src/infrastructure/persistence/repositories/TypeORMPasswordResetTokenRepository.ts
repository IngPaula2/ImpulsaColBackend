import { DataSource, Repository, LessThan, MoreThan } from 'typeorm';
import { PasswordResetTokenEntity } from '../entities/PasswordResetTokenEntity';
import { IPasswordResetTokenRepository } from '../../../domain/ports/IPasswordResetTokenRepository';

export class TypeORMPasswordResetTokenRepository implements IPasswordResetTokenRepository {
  private repo: Repository<PasswordResetTokenEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.repo = this.dataSource.getRepository(PasswordResetTokenEntity);
  }

  async create(token: PasswordResetTokenEntity): Promise<PasswordResetTokenEntity> {
    return this.repo.save(token);
  }

  async findByToken(token: string): Promise<PasswordResetTokenEntity | null> {
    return this.repo.findOne({ where: { token } });
  }

  async markAsUsed(token: string): Promise<void> {
    await this.repo.update({ token }, { used: true });
  }

  async deleteExpired(): Promise<void> {
    await this.repo.delete({ expires_at: LessThan(new Date()), used: false });
  }

  async findValidByUserId(userId: number): Promise<PasswordResetTokenEntity | null> {
    return this.repo.findOne({
      where: {
        user_id: userId,
        used: false,
        expires_at: MoreThan(new Date()),
      },
      order: { expires_at: 'DESC' },
    });
  }
} 