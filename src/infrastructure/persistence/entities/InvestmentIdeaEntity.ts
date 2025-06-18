import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './UserEntity';

@Entity('investment_ideas')
export class InvestmentIdeaEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  user_id!: number;

  @ManyToOne(() => UserEntity, user => user.id)
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ length: 100 })
  title!: string;

  @Column('text')
  description!: string;

  @Column({ length: 50, nullable: true })
  category!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  target_amount!: number;

  @Column({ type: 'int', nullable: true })
  investors_needed!: number;

  @Column({ type: 'text', nullable: true })
  investor_message!: string;

  @CreateDateColumn()
  created_at!: Date;
} 