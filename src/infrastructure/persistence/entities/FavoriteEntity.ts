import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { UserEntity } from './UserEntity';

@Entity('favorites')
@Index('IDX_d79c62744d4ed4e977ccf78fc9', ['user_id', 'item_id', 'item_type'], { unique: true })
export class FavoriteEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    user_id!: number;

    @Column()
    item_id!: number;

    @Column({ length: 50 })
    item_type!: string;

    @Column({ type: 'jsonb' })
    item_data!: any;

    @CreateDateColumn()
    created_at!: Date;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'user_id' })
    user!: UserEntity;
} 