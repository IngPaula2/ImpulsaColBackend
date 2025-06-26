import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { UserEntity } from './UserEntity';

export enum NotificationType {
    WELCOME = 'welcome',
    FAVORITE = 'favorite',
    MESSAGE = 'message',
    RATING = 'rating',
    NEW_PRODUCT = 'new_product',
    NEW_ENTREPRENEURSHIP = 'new_entrepreneurship',
    NEW_INVESTMENT_IDEA = 'new_investment_idea',
    SYSTEM = 'system'
}

@Entity('notifications')
@Index('IDX_notifications_user_id', ['user_id'])
@Index('IDX_notifications_user_id_is_read', ['user_id', 'is_read'])
@Index('IDX_notifications_type', ['type'])
export class NotificationEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    user_id!: number;

    @Column({
        type: 'varchar',
        length: 50,
        enum: NotificationType
    })
    type!: NotificationType;

    @Column({ length: 255 })
    title!: string;

    @Column('text')
    message!: string;

    @Column({ type: 'jsonb', nullable: true })
    data?: any;

    @Column({ default: false })
    is_read!: boolean;

    @CreateDateColumn({ name: 'created_at' })
    created_at!: Date;

    @Column({ type: 'timestamp', nullable: true })
    read_at?: Date;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'user_id' })
    user!: UserEntity;
} 