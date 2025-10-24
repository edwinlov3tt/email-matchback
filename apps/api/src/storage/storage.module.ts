import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ExcelService } from './excel.service';
import { StorageService } from './storage.service';

@Module({
  imports: [ConfigModule],
  providers: [ExcelService, StorageService],
  exports: [ExcelService, StorageService],
})
export class StorageModule {}
