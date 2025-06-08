import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    email!: string;

    @Column({ name: 'password_hash' })
    password_hash!: string;

    @Column({ name: 'full_name' })
    full_name!: string;

    @Column({ nullable: true })
    document_type?: string;

    @Column({ nullable: true })
    document_number?: string;

    @Column({ nullable: true })
    phone?: string;

    @Column({ nullable: true })
    address?: string;

    @Column({ nullable: true })
    city?: string;

    @Column({ nullable: true })
    department?: string;

    @Column({ nullable: true })
    country?: string;

    @Column({ type: 'timestamp', nullable: true })
    birth_date?: Date;

    @CreateDateColumn({ name: 'created_at' })
    created_at!: Date;
} 