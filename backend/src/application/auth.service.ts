import { UserRepository } from '../infrastructure/user.repository';
import { User } from '../domain/user.entity';
import bcrypt from 'bcryptjs';

export class AuthService {
  private userRepository = new UserRepository();

  async register(user: User): Promise<User> {
    const password_hash = await bcrypt.hash(user.password_hash || '', 10);
    const newUser = await this.userRepository.create({ ...user, password_hash });
    return newUser;
  }

  async login(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return null;
    const isMatch = await bcrypt.compare(password, user.password_hash || '');
    if (!isMatch) return null;
    return user;
  }
} 