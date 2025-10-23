/**
 * Convert Excel serial date number to JavaScript Date
 * Excel epoch: 1900-01-01 (with a leap year bug at 1900)
 */
export function excelDateToJS(serial: number): Date {
  if (!serial || typeof serial !== 'number') {
    throw new Error('Invalid Excel date serial number');
  }

  // Excel incorrectly treats 1900 as a leap year, so we subtract 2 days
  // instead of 1 for dates after March 1, 1900
  const epoch = new Date(1900, 0, 1);
  const days = serial > 60 ? serial - 2 : serial - 1;
  const milliseconds = days * 86400000; // 24 * 60 * 60 * 1000

  return new Date(epoch.getTime() + milliseconds);
}

/**
 * Convert JavaScript Date to Excel serial number
 */
export function jsDateToExcel(date: Date): number {
  const epoch = new Date(1900, 0, 1);
  const days = Math.floor((date.getTime() - epoch.getTime()) / 86400000);

  // Account for Excel's leap year bug
  return days > 59 ? days + 2 : days + 1;
}

/**
 * Check if a value is likely an Excel serial date
 */
export function isExcelSerial(value: any): boolean {
  if (typeof value !== 'number') {
    return false;
  }

  // Excel dates typically range from 1 (1900-01-01) to ~50000 (2136)
  // This is a reasonable range for our use case
  return value > 0 && value < 100000;
}

/**
 * Safely convert a value that might be an Excel date or JS Date
 */
export function parseDate(value: any): Date {
  if (value instanceof Date) {
    return value;
  }

  if (isExcelSerial(value)) {
    return excelDateToJS(value);
  }

  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  throw new Error(`Unable to parse date from value: ${value}`);
}
