import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column('text', { nullable: true })
    full_name?: string;

    @Column('text', { nullable: true })
    email?: string;

    @Column('text', { nullable: true })
    password_hash?: string;

    @Column('text', { nullable: true })
    document_type?: string;

    @Column('text', { nullable: true })
    document_number?: string;

    @Column('text', { nullable: true })
    phone?: string;

    @Column('text', { nullable: true })
    address?: string;

    @Column('text', { nullable: true })
    city?: string;

    @Column('text', { nullable: true })
    department?: string;

    @Column('text', { nullable: true, default: 'Colombia' })
    country?: string;

    @Column('date', { nullable: true })
    birth_date?: Date;

    @Column('timestamp', { nullable: true, default: () => 'now()' })
    created_at?: Date;
}
