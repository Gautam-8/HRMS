import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('documents')
export class Document {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column('text')
    content: string;

    @Column('json')
    embedding: number[];

    @Column()
    organizationId: string;

    @CreateDateColumn()
    createdAt: Date;
} 