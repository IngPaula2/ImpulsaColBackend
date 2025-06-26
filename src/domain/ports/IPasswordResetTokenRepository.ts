import { PasswordResetTokenEntity } from '../../infrastructure/persistence/entities/PasswordResetTokenEntity';

export interface IPasswordResetTokenRepository {
  create(token: PasswordResetTokenEntity): Promise<PasswordResetTokenEntity>;
  findByToken(token: string): Promise<PasswordResetTokenEntity | null>;
  markAsUsed(token: string): Promise<void>;
  deleteExpired(): Promise<void>;
  findValidByUserId(userId: number): Promise<PasswordResetTokenEntity | null>;
} 