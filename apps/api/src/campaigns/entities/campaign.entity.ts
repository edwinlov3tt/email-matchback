import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import type {
  CampaignStatus,
  CampaignType,
  Priority,
  CampaignMetrics,
} from '@matchback/types';
import { MatchRecord } from './match-record.entity';

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  billingNumber: string;

  @Column({ type: 'date' })
  dropDate: Date;

  @Column({ type: 'date', nullable: true })
  redropDate: Date | null;

  @Column({ type: 'simple-array' })
  markets: string[];

  @Column({ type: 'varchar', length: 255, unique: true })
  emailEndpoint: string;

  @Column({
    type: 'enum',
    enum: [
      'pending',
      'collecting',
      'matching',
      'analyzing',
      'complete',
      'error',
    ],
    default: 'pending',
  })
  status: CampaignStatus;

  @Column({
    type: 'enum',
    enum: ['acquisition', 'winback', 'retention', 'seasonal'],
    default: 'acquisition',
  })
  campaignType: CampaignType;

  @Column({
    type: 'enum',
    enum: ['normal', 'high', 'urgent'],
    default: 'normal',
  })
  priority: Priority;

  @Column({ type: 'int', nullable: true })
  expectedRecords: number | null;

  @Column({ type: 'varchar', length: 255 })
  vendorEmail: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metrics: CampaignMetrics | null;

  @OneToMany(() => MatchRecord, (record) => record.campaign)
  records: MatchRecord[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
