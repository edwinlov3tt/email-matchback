# Storage Module

Handles Excel file processing and Cloudflare R2 cloud storage operations.

## Services

### ExcelService

Parses and generates Excel files using ExcelJS.

**Key Features:**
- Parse client data Excel files with flexible column name handling
- Convert Excel serial dates to JavaScript Date objects
- Generate sanitized Excel files for vendor matching
- Create comprehensive Excel reports with multiple sheets

**Usage:**

```typescript
import { ExcelService } from './storage/excel.service';

// Parse client data upload
const result = await excelService.parseClientData(buffer);
console.log(`Parsed ${result.validRows} out of ${result.totalRows} rows`);
console.log(`Errors: ${result.errors.length}`);

// Create sanitized data for vendor
const sanitizedBuffer = await excelService.createSanitizedExcel([
  {
    dcmId: 'TIDE123-NYC-1234567890-00001',
    firstName: 'John',
    lastName: 'Doe',
    emailAddress: 'john@example.com',
  }
]);

// Generate report
const reportBuffer = await excelService.createReport({
  summary: [
    { label: 'Total Records', value: 1000 },
    { label: 'Matched', value: 750 },
  ],
  matched: matchedRecords,
  unmatched: unmatchedRecords,
});
```

**Column Name Handling:**

The parser handles common variations:
- `Visit1` or `Visit_1`
- `SignupDate` or `Signup Date`
- `CustomerID` or `Customer ID`

All column comparisons are case-insensitive.

**Date Conversion:**

ALWAYS uses `excelDateToJS()` from `@matchback/utils` for accurate date conversion:

```typescript
import { excelDateToJS, parseDate } from '@matchback/utils';

// Excel serial number (e.g., 44927 = 2023-01-01)
const date = excelDateToJS(44927);

// Flexible parsing (handles serial, Date objects, or strings)
const date = parseDate(value);
```

### StorageService

Manages file storage in Cloudflare R2 (S3-compatible).

**Key Features:**
- Upload/download files to/from R2
- Campaign-specific file organization
- File metadata and listing
- Automatic content-type detection

**Usage:**

```typescript
import { StorageService } from './storage/storage.service';

// Upload client data
const result = await storageService.uploadClientData(
  campaignId,
  buffer,
  'client-data.xlsx'
);
console.log(`Uploaded: ${result.url}`);

// Upload sanitized data for vendor
await storageService.uploadSanitizedData(campaignId, buffer);

// Upload vendor response
await storageService.uploadVendorResponse(campaignId, buffer);

// Upload final report
await storageService.uploadReport(campaignId, buffer);

// Download file
const buffer = await storageService.downloadFile(result.key);

// Check if file exists
const exists = await storageService.fileExists(result.key);

// List campaign files
const files = await storageService.listFiles(`campaigns/${campaignId}`);

// Delete file
await storageService.deleteFile(result.key);
```

**File Organization:**

Files are organized by campaign and type:
```
campaigns/
  {campaignId}/
    client-data/
      {timestamp}-client-data.xlsx
    sanitized/
      {timestamp}-sanitized-data.xlsx
    vendor-response/
      {timestamp}-vendor-response.xlsx
    report/
      {timestamp}-matchback-report.xlsx
```

## Configuration

Required environment variables:

```env
# Cloudflare R2 credentials
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=matchback-files
R2_PUBLIC_URL=https://your-bucket.r2.cloudflarestorage.com
```

## Testing

```bash
# Run storage service tests
npm test storage.service.spec.ts

# Run Excel service tests
npm test excel.service.spec.ts
```

## Common Patterns

### Complete Campaign File Workflow

```typescript
// 1. Upload and parse client data
const uploadResult = await storageService.uploadClientData(
  campaignId,
  clientDataBuffer
);

const downloadedBuffer = await storageService.downloadFile(uploadResult.key);
const parsedData = await excelService.parseClientData(downloadedBuffer);

// 2. Create and upload sanitized data
const sanitizedRecords = parsedData.records.map(record => ({
  dcmId: generateDcmId(campaign, index),
  firstName: record.FirstName,
  lastName: record.LastName,
  emailAddress: record.EmailAddress,
}));

const sanitizedBuffer = await excelService.createSanitizedExcel(sanitizedRecords);
await storageService.uploadSanitizedData(campaignId, sanitizedBuffer);

// 3. Process vendor response and generate report
// ... matching logic ...

const reportBuffer = await excelService.createReport(reportData);
await storageService.uploadReport(campaignId, reportBuffer);
```

### Error Handling

```typescript
try {
  const result = await excelService.parseClientData(buffer);

  if (result.errors.length > 0) {
    logger.warn(`Parse errors: ${result.errors.join(', ')}`);
  }

  if (result.validRows === 0) {
    throw new Error('No valid records found in uploaded file');
  }
} catch (error) {
  logger.error('Failed to parse client data', error);
  throw error;
}
```

## Critical Rules

1. **Always use excelDateToJS()** - Never manually parse Excel date serials
2. **Handle missing data gracefully** - ~25% of records may lack email addresses
3. **Validate market consistency** - Use `@matchback/utils` market detection utilities
4. **Log all operations** - Maintain audit trail for file operations
5. **Clean up temporary files** - Delete intermediate files after processing
