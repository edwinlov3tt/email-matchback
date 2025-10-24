import { Module } from '@nestjs/common';
import { FileParserService } from './file-parser.service';
import { ExcelParser } from './parsers/excel.parser';
import { CSVParser } from './parsers/csv.parser';

@Module({
  providers: [FileParserService, ExcelParser, CSVParser],
  exports: [FileParserService, ExcelParser, CSVParser],
})
export class FileProcessingModule {}
