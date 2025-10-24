import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import type { CustomerType } from '@matchback/types';
import { Campaign } from './campaign.entity';

@Entity('match_records')
@Index(['dcmId'], { unique: true })
@Index(['customerId'])
@Index(['emailAddress'])
@Index(['campaignId'])
export class MatchRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  dcmId: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  customerId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  emailAddress: string | null;

  @Column({ type: 'date' })
  signupDate: Date;

  @Column({ type: 'int', default: 0 })
  totalVisits: number;

  @Column({ type: 'date', nullable: true })
  visit1Date: Date | null;

  @Column({ type: 'boolean', default: false })
  matched: boolean;

  @Column({ type: 'boolean', nullable: true })
  inPattern: boolean | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  patternOverride: string | null;

  @Column({
    type: 'enum',
    enum: ['NEW_SIGNUP', 'NEW_VISITOR', 'WINBACK', 'EXISTING'],
    nullable: true,
  })
  customerType: CustomerType | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalSales: number | null;

  @Column({ type: 'uuid' })
  @Index()
  campaignId: string;

  @Column({ type: 'varchar', length: 100 })
  market: string;

  @ManyToOne(() => Campaign, (campaign) => campaign.records, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'campaignId' })
  campaign: Campaign;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
