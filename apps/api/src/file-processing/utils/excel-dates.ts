/**
 * Excel Date Conversion Utilities
 *
 * Excel stores dates as serial numbers representing days since January 1, 1900.
 * This module provides robust conversion between Excel serial dates and JavaScript Date objects.
 */

/**
 * Convert Excel serial date to JavaScript Date
 * @param serial - Excel serial number (days since 1900-01-01)
 * @returns JavaScript Date object
 */
export function excelDateToJS(serial: number): Date {
  // Excel incorrectly treats 1900 as a leap year
  // Excel serial 60 = February 29, 1900 (which didn't exist)
  // We need to account for this by subtracting 1 for dates after Feb 28, 1900
  const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
  const msPerDay = 86400000; // 24 * 60 * 60 * 1000

  // Adjust for Excel's leap year bug
  const adjustedSerial = serial > 60 ? serial - 1 : serial;

  return new Date(excelEpoch.getTime() + adjustedSerial * msPerDay);
}

/**
 * Convert JavaScript Date to Excel serial number
 * @param date - JavaScript Date object
 * @returns Excel serial number
 */
export function jsDateToExcel(date: Date): number {
  const excelEpoch = new Date(1899, 11, 30);
  const msPerDay = 86400000;

  const serial = Math.floor((date.getTime() - excelEpoch.getTime()) / msPerDay);

  // Adjust for Excel's leap year bug
  return serial >= 60 ? serial + 1 : serial;
}

/**
 * Check if a value is a valid Excel date serial number
 * @param value - Value to check
 * @returns true if value is a valid Excel date
 */
export function isExcelDate(value: any): boolean {
  if (typeof value !== 'number') return false;
  if (isNaN(value)) return false;
  if (value < 1) return false; // Excel dates start at 1 (January 1, 1900)
  if (value > 2958465) return false; // December 31, 9999

  return true;
}

/**
 * Safely convert a cell value to a Date
 * Handles Excel serial numbers, Date objects, and date strings
 * @param value - Cell value
 * @returns Date object or null if invalid
 */
export function safeDateConversion(value: any): Date | null {
  if (value == null) return null;

  // Already a Date object
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  // Excel serial number
  if (typeof value === 'number' && isExcelDate(value)) {
    return excelDateToJS(value);
  }

  // String date
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

/**
 * Format a date as YYYY-MM-DD
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse various date formats commonly found in Excel files
 * @param value - Value to parse
 * @returns Date object or null
 */
export function parseFlexibleDate(value: any): Date | null {
  const date = safeDateConversion(value);
  if (date) return date;

  // Try common formats
  if (typeof value === 'string') {
    // MM/DD/YYYY or M/D/YYYY
    const usFormat = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const usMatch = value.match(usFormat);
    if (usMatch) {
      const [, month, day, year] = usMatch;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // YYYY-MM-DD
    const isoFormat = /^(\d{4})-(\d{2})-(\d{2})$/;
    const isoMatch = value.match(isoFormat);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // DD/MM/YYYY or D/M/YYYY
    const ukFormat = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const ukMatch = value.match(ukFormat);
    if (ukMatch) {
      const [, day, month, year] = ukMatch;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      // Validate it's a real date
      if (date.getDate() === parseInt(day)) {
        return date;
      }
    }
  }

  return null;
}
