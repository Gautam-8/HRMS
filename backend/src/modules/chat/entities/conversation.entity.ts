import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Message } from './message.entity';

@Entity('conversations')
export class Conversation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column()
    organizationId: string;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => Message, message => message.conversation)
    messages: Message[];
} 