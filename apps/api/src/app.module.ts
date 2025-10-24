import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Campaign } from './campaigns/entities/campaign.entity';
import { MatchRecord } from './campaigns/entities/match-record.entity';
import { User } from './users/entities/user.entity';
import { CampaignsModule } from './campaigns/campaigns.module';
import { UploadsModule } from './uploads/uploads.module';
import { FileProcessingModule } from './file-processing/file-processing.module';
import { MatchingModule } from './matching/matching.module';
import { ReportsModule } from './reports/reports.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USER || 'matchback',
      password: process.env.DATABASE_PASSWORD || 'matchback_dev_password',
      database: process.env.DATABASE_NAME || 'matchback_db',
      entities: [Campaign, MatchRecord, User],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
    }),
    CampaignsModule,
    UploadsModule,
    FileProcessingModule,
    MatchingModule,
    ReportsModule,
    JobsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
