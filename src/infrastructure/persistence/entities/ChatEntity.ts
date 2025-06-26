import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { UserEntity } from './UserEntity';
import { MessageEntity } from './MessageEntity';

@Entity('chats')
export class ChatEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  project_id?: number;

  @Column({ nullable: true })
  user1_id?: number;

  @Column({ nullable: true })
  user2_id?: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user1_id' })
  user1?: UserEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user2_id' })
  user2?: UserEntity;

  @OneToMany(() => MessageEntity, message => message.chat)
  messages!: MessageEntity[];

  @CreateDateColumn()
  created_at!: Date;

  // Campo virtual para el último mensaje
  lastMessage?: MessageEntity;

  // Campo virtual para participantes
  participants?: UserEntity[];
} 