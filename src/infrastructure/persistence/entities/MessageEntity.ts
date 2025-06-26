import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ChatEntity } from './ChatEntity';
import { UserEntity } from './UserEntity';

@Entity('messages')
export class MessageEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  chat_id!: number;

  @Column()
  sender_id!: number;

  @Column('text')
  content!: string;

  @CreateDateColumn({ name: 'sent_at' })
  sent_at!: Date;

  @ManyToOne(() => ChatEntity, chat => chat.messages)
  @JoinColumn({ name: 'chat_id' })
  chat!: ChatEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'sender_id' })
  sender!: UserEntity;
} 