import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { EntrepreneurshipEntity } from './EntrepreneurshipEntity';
import { InvestmentIdeaEntity } from './InvestmentIdeaEntity';

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

    @Column({ default: false })
    notifications_enabled!: boolean;

    @Column({ type: 'timestamp', nullable: true })
    last_login?: Date;

    @CreateDateColumn({ name: 'created_at' })
    created_at!: Date;

    @Column({ nullable: true })
    profile_image?: string;

    @OneToMany(() => EntrepreneurshipEntity, entrepreneurship => entrepreneurship.user)
    entrepreneurships!: EntrepreneurshipEntity[];

    @OneToMany(() => InvestmentIdeaEntity, idea => idea.user)
    investmentIdeas!: InvestmentIdeaEntity[];
} 