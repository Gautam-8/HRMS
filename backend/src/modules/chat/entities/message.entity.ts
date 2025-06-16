import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity('messages')
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    conversationId: string;

    @Column('text')
    content: string;

    @Column()
    role: 'user' | 'assistant';

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Conversation, conversation => conversation.messages)
    conversation: Conversation;
} 