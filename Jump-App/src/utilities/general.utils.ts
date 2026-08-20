import { Page, test } from '@playwright/test';
import { addDays, format } from 'date-fns';
import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

const FILE_BASE_PATH = `src/data/${process.env.NODE_ENV || 'dev'}/files/`;

/**
 * Splits an array into chunks of a specified size.
 *
 * @param array The array to be chunked.
 * @param chunkSize The size of each chunk.
 * @returns A new array containing the chunks of the original array.
 */
export const chunkArray = (array: string[], chunkSize: number): string[][] => {
  const result: string[][] = [];
  for (let index = 0; index < array.length; index += chunkSize) {
    const chunk = array.slice(index, index + chunkSize);
    result.push(chunk);
  }
  return result;
};

// Returns date in 'DD/MM/YYYY' format
export function fixDateFormat(date: Date, formatStr?: string): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  if (formatStr === 'YYYY-MM-DD') {
    return `${year}-${month}-${day}`; // YYYY-MM-DD format
  }

  return `${day}/${month}/${year}`; // Combine them in DD-MM-YYYY format
}

export function getDate(formatStr: string = 'dd-MM-yyyy', dateInput: string = 'today'): string {
  let date: Date;

  // Handle special keywords like 'today', 'yesterday', 'tomorrow', or relative offsets
  // Updated regex to handle spaces between 'today' and '+' and between '+' and number
  const match = dateInput.match(/today\s*([+-])\s*(\d+)/i);

  if (match) {
    const operator = match[1]; // '+' or '-'
    const days = parseInt(match[2], 10);
    const offsetDays = operator === '+' ? days : -days;
    date = addDays(new Date(), offsetDays);
    //logic to subtract 1 day if needed for expiry date
    if (dateInput.includes('365')) {
      date = addDays(date, -1);
    }
  } else if (dateInput.toLowerCase() === 'today') {
    date = new Date(); // Handle plain 'today'
  } else if (dateInput.toLowerCase() === 'yesterday') {
    date = addDays(new Date(), -1);
  } else if (dateInput.toLowerCase() === 'tomorrow') {
    date = addDays(new Date(), 1);
  } else {
    // Try to parse a fixed date string
    date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      throw new Error(`Received date value "${dateInput}" is not recognized`);
    }
  }

  // Check for ISO date-time format
  if (formatStr === 'iso' || formatStr === 'ISO' || formatStr === 'timestamp') {
    // Return in format: YYYY-MM-DDThh:mm:ss
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  // Return the formatted date
  return format(date, formatStr);
}

export function resolveDate(dateInput: string): Date {
  if (dateInput.toLowerCase() === 'today') {
    return new Date();
  } else if (dateInput.toLowerCase() === 'tomorrow') {
    return addDays(new Date(), 1);
  } else if (dateInput.toLowerCase() === 'yesterday') {
    return addDays(new Date(), -1);
  } else {
    const parsedDate = new Date(dateInput);
    if (isNaN(parsedDate.getTime())) {
      throw new Error(`Invalid date input: "${dateInput}"`);
    }
    return parsedDate;
  }
}

// Returns date with required Month Name
export function getFormattedDateWithMonthName(date: Date): string {
  const day = String(date.getDate());
  const year = date.getFullYear();

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedDate = `${day} ${monthNames[date.getMonth()]} ${year}`;

  return formattedDate; // returns date in format eg: 9 Sep 2024
}

// Returns date with day name and formatted date
export function getFormattedDateWithDayName(date: Date = new Date()): string {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const dayName = dayNames[date.getDay()];
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName} ${day} ${month} ${year}`; // returns date in format eg: Wednesday 3 Sep 2025
}

/**
 * Constructs and returns the full path to a file.
 *
 * @param filePath - The relative path from the base directory to the file, including any folders.
 * @returns The full file path as a string.
 */
export const getDataFilePath = (filePath: string): string => {
  return `${FILE_BASE_PATH}${filePath}`;
};

/**
 * Converts a file to its base64 representation.
 *
 * @param fileName - The file name with extension (e.g., 'image.png').
 * @returns - The base64 encoded string of the file.
 */
export const convertFileToBase64 = (fileName: string): string => {
  const filePath = getDataFilePath(fileName); // Get the full file path using the getDataFilePath function
  const absFilePath = path.resolve(filePath);
  try {
    const fileBuffer = fs.readFileSync(absFilePath);
    return fileBuffer.toString('base64'); // Return the base64 encoded data
  } catch (err) {
    throw new Error(`Error reading the file: ${err.message}`);
  }
};

interface Cookie {
  name: string;
  value: string;
}

export function getValueFromCookies(
  filename: 'financial-crime' | 'underwriter-assistant' | 'underwriter-technician' | 'underwriter',
  cookieKeyName: 'AWSALBAuthNonce' | 'AWSELBAuthSessionCookie-0' | 'AWSELBAuthSessionCookie-1' | 'JSESSIONID',
): string | undefined {
  const storageStateDir = path.resolve(process.cwd(), 'src', 'cookies');
  const filePath = path.join(storageStateDir, `${filename}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return undefined;
  }
  try {
    const fileContents = fs.readFileSync(filePath, 'utf-8');

    const cookiesData: { cookies: Cookie[] } = JSON.parse(fileContents);

    // Find the cookie object with the specified name and return its value
    const foundCookie = cookiesData.cookies.find((c: Cookie) => c.name === cookieKeyName);
    return foundCookie?.value;
  } catch (error: unknown) {
    console.error(`Error reading or parsing file ${filePath}:`, error);
    return undefined;
  }
}

export function normalizeText(value: string): string {
  return value
    .replace(/[\u00A0\u202F\u2007]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parsePriceToNumber(value: string): number {
  const withSpacesNormalized = value.replace(/[\u00A0\u202F\u2007]/g, " ");
  const numericPortion = withSpacesNormalized
    .replace(/[^\d,.\-]/g, "")
    .replace(/\.(?=.*\.)/g, "")
    .replace(",", ".");
  return parseFloat(numericPortion);
}

/**
 * Returns the date for next year or month (one day before) in specified format
 *
 * @param currentDate - The current date to calculate from
 * @param period - 'year' or 'month' to determine which period to calculate
 * @param formatStr - Optional format string using date-fns format tokens (e.g., 'dd-MM-yyyy', 'dd MMM yyyy', 'yyyy/MM/dd')
 * @returns Date string in specified format
 */

export function getNextPeriodDate(
  currentDate: Date,
  period: 'month' | 'year',
  step: number = 1, // NEW: how many months or years to add
  formatStr?: string,
): string {
  const date = new Date(currentDate);

  if (period === 'year') {
    date.setFullYear(date.getFullYear() + step);
  } else {
    date.setMonth(date.getMonth() + step);
  }

  // Subtract one day to get the last day of the previous period
  date.setDate(date.getDate() - 1);

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date calculation');
  }

  // Adjust default formatting based on day
  const day = date.getDate();
  const defaultFormat = day < 10 ? 'd MMM yyyy' : 'dd MMM yyyy';

  return format(date, formatStr ?? defaultFormat);
}

export function getCurrentDay(): string {
  const currentDay = new Date().getDate();
  return currentDay.toString();
}

export function getCountryCode(country: string): string {
  const countryCodeMap: { [key: string]: string } = {
    Australia: 'AU',
    Belgium: 'BE',
    Brazil: 'BR',
    Canada: 'CA',
    China: 'CN',
    France: 'FR',
    Germany: 'DE',
    India: 'IN',
    Italy: 'IT',
    Japan: 'JP',
    Mexico: 'MX',
    Netherlands: 'NL',
    'New Zealand': 'NZ',
    Singapore: 'SG',
    'South Africa': 'ZA',
    Spain: 'ES',
    Switzerland: 'CH',
    'United Arab Emirates': 'AE',
    'United Kingdom of Great Britain and Northern Ireland': 'GB',
    'United States of America': 'USA',
  };

  return countryCodeMap[country] || 'US'; // Default to US if country not found
}

export function getCurrencyCode(currency: string): string {
  const currencyCodeMap: { [key: string]: string } = {
    'Australian Dollar': 'AUD',
    'British Pound - Sterling': 'GBP',
    'Canadian Dollar': 'CAD',
    'Chinese Yuan': 'CNY',
    Euro: 'EUR',
    'Japanese Yen': 'JPY',
    'New Zealand Dollar': 'NZD',
    'Singapore Dollar': 'SGD',
    'South African Rand': 'ZAR',
    'Swedish Krona': 'SEK',
    'Swiss Frank': 'CHF',
    'U.A.E. Dirham': 'AED',
    'United States Dollar': 'USD',
  };

  return currencyCodeMap[currency] || 'USD'; // Default to USD if currency not found
}

export function convertToUpperCasingAndRepSpaceWithUnderscore(str: string): string {
  /**
   * Formats a string into an API enum format by converting to uppercase and replacing spaces with underscores
   *
   * @param input The input string (e.g., "Open Market")
   * @returns Formatted string for API use (e.g., "OPEN_MARKET")
   */
  return str.toUpperCase().replace(/\s+/g, '_');
}

//returns current year
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function navigateToFirstTab(page: Page, firstTabUrl: string): Promise<Page> {
  return test.step('⏩ Navigate to First Tab', async (): Promise<Page> => {
    if (firstTabUrl) {
      const pages = page.context().pages();
      const originalPage = pages[0];
      await originalPage.bringToFront();
      await originalPage.goto(firstTabUrl);
      await originalPage.waitForLoadState('domcontentloaded');

      // Return the original page so the caller can use the updated context
      return originalPage;
    }
    return page;
  });
}

export async function switchToNewTabContext(page: Page): Promise<{
  newPage: Page;
  originalPage: Page;
}> {
  return await test.step('⏩ Switch to New Tab Context', async (): Promise<{
    newPage: Page;
    originalPage: Page;
  }> => {
    const pages = page.context().pages();
    const pageCount = pages.length;

    if (pageCount <= 1) {
      throw new Error('Expected new tab to be opened but no additional pages found');
    }

    // Get the new tab (last page in the context)
    const newPage = pages[pageCount - 1];

    // Store original page reference
    const originalPage = page;

    // Wait for the new page to be ready
    try {
      await newPage.waitForLoadState('domcontentloaded');
    } catch (error) {
      throw new Error('New page load timeout, continuing anyway...');
    }

    return { newPage, originalPage };
  });
}

export async function storeRiskIdInExcel(riskId: string, status: string): Promise<void> {
  try {
    const currentEnv = process.env.NODE_ENV || 'dev';
    const storeRiskIdInExcelFile = process.env.storeRiskIdInExcel === 'true' || false;

    if (!storeRiskIdInExcelFile) {
      throw new Error('Storing RiskId in Excel is disabled, skipping storage of RiskId...');
    }

    const filePath = path.resolve(__dirname, '../../riskIds.xlsx');

    let workbook: XLSX.WorkBook;
    let worksheet: XLSX.WorkSheet;

    if (fs.existsSync(filePath)) {
      // Check if the file exists
      workbook = XLSX.readFile(filePath);

      if (workbook.Sheets[`RiskIds_${currentEnv}`]) {
        worksheet = workbook.Sheets[`RiskIds_${currentEnv}`];
      } else {
        worksheet = XLSX.utils.aoa_to_sheet([['RiskIds', 'Status', 'CreatedDate', 'Environment']]) as XLSX.WorkSheet;

        XLSX.utils.book_append_sheet(workbook, worksheet, `RiskIds_${currentEnv}`);
      }
    } else {
      workbook = XLSX.utils.book_new() as XLSX.WorkBook;

      worksheet = XLSX.utils.aoa_to_sheet([['RiskIds', 'Status', 'CreatedDate', 'Environment']]) as XLSX.WorkSheet;

      XLSX.utils.book_append_sheet(workbook, worksheet, `RiskIds_${currentEnv}`);
    }

    const existingData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

    const newRow = [riskId, status, new Date().toISOString().split('T')[0], currentEnv];
    existingData.push(newRow);

    worksheet = XLSX.utils.aoa_to_sheet(existingData);

    workbook.Sheets[`RiskIds_${currentEnv}`] = worksheet;

    XLSX.writeFile(workbook, filePath);
  } catch (error) {
    throw new Error(`Error storing RiskId ${riskId} in Excel file: ${error}`);
  }
}

export async function removeRiskIdFromExcel(riskId: string): Promise<boolean> {
  const currentEnv = process.env.NODE_ENV || 'dev';

  const filePath = path.resolve(__dirname, '../../riskIds.xlsx');

  if (!fs.existsSync(filePath)) {
    throw new Error(`Excel file does not exist at ${filePath}`);
    return false;
  }

  try {
    const workbook: XLSX.WorkBook = XLSX.readFile(filePath);

    if (!workbook.Sheets[`RiskIds_${currentEnv}`]) {
      throw new Error(`Worksheet RiskIds_${currentEnv} does not exist`);
      return false;
    }

    const worksheet: XLSX.WorkSheet = workbook.Sheets[`RiskIds_${currentEnv}`];

    const existingData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

    const rowIndex = existingData.findIndex((row) => row[0] === riskId);

    if (rowIndex === -1) {
      throw new Error(`RiskId ${riskId} not found in worksheet RiskIds_${currentEnv}`);
      return false;
    }

    existingData.splice(rowIndex, 1);

    const updatedWorksheet = XLSX.utils.aoa_to_sheet(existingData);

    workbook.Sheets[`RiskIds_${currentEnv}`] = updatedWorksheet;

    XLSX.writeFile(workbook, filePath);
    return true;
  } catch (error) {
    throw new Error(`Error removing RiskId ${riskId} from Excel file: ${error}`);
  }
}

export async function storeRiskIdInDataFile(riskId: string): Promise<boolean> {
  try {
    const currentEnv = process.env.NODE_ENV || 'dev';

    const filePath = path.resolve(
      __dirname,
      `../data/${currentEnv}/develop&MaintainRisks/develop&maintainRisks.data.ts`,
    );

    if (!fs.existsSync(filePath)) {
      throw new Error(`Data file does not exist at ${filePath}`);
      return false;
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');

    const testCasePattern = /'update-risk-status':\s*{[\s\S]*?riskids:\s*\[([^\]]*)\]/;
    const match = fileContent.match(testCasePattern);

    if (!match) {
      throw new Error("Test case 'update-risk-status' or riskids array not found in data file");
      return false;
    }

    const existingRiskIds = match[1].trim();
    let newRiskIdsArray: string[];

    if (existingRiskIds === '') {
      newRiskIdsArray = [riskId];
    } else {
      const existingIds = existingRiskIds.split(',').map((id) => id.trim().replace(/['"]/g, ''));
      newRiskIdsArray = [...existingIds, riskId];
    }

    const newRiskIdsString = `[${newRiskIdsArray.map((id) => `'${id}'`).join(', ')}]`;

    const oldRiskIdsPattern = /(riskids:\s*)\[[^\]]*\]/;
    const newContent = fileContent.replace(oldRiskIdsPattern, `$1${newRiskIdsString}`);

    fs.writeFileSync(filePath, newContent, 'utf8');

    return true;
  } catch (error) {
    throw new Error(`Error storing RiskId ${riskId} in data file: ${error}`);
    return false;
  }
}

export async function emptyRiskIdsArray(): Promise<boolean> {
  try {
    const currentEnv = process.env.NODE_ENV || 'dev';
    const filePath = path.resolve(
      __dirname,
      `../data/${currentEnv}/develop&MaintainRisks/develop&maintainRisks.data.ts`,
    );

    if (!fs.existsSync(filePath)) {
      throw new Error(`Data file does not exist at ${filePath}`);
      return false;
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');

    const testCasePattern = /'update-risk-status':\s*{[\s\S]*?riskids:\s*\[([^\]]*)\]/;
    const match = fileContent.match(testCasePattern);

    if (!match) {
      throw new Error("Test case 'update-risk-status' or riskids array not found in data file");
      return false;
    }

    const oldRiskIdsPattern = /(riskids:\s*)\[[^\]]*\]/;
    const newContent = fileContent.replace(oldRiskIdsPattern, '$1[]');

    fs.writeFileSync(filePath, newContent, 'utf8');

    return true;
  } catch (error) {
    throw new Error(`Error emptying riskIds array in data file: ${error}`);
    return false;
  }
}

/**
 * Adds two price strings (e.g., "$10.45", "$3.7") and returns a formatted string sum.
 * - Strips currency symbols and commas
 * - Computes in cents to avoid floating-point errors
 * - Returns with two decimals, prefixed with '$' if either input had it
 */
export function sumPrices(priceA: string, priceB: string): string {
  const toCents = (value: string): number => {
    const numeric = value.replace(/[^0-9.,-]/g, '').replace(/,/g, '');
    if (!numeric || numeric === '-' || numeric === '.') return 0;
    const parsed = parseFloat(numeric);
    if (Number.isNaN(parsed)) return 0;
    return Math.round(parsed * 100);
  };

  const totalCents = toCents(priceA) + toCents(priceB);
  const total = (totalCents / 100).toFixed(2);
  const hasDollar = priceA.includes('$') || priceB.includes('$');
  return `${hasDollar ? '$' : ''}${total}`;
}

export function sumPricesForFrench(priceA: string, priceB: string): string {
  const toCents = (value: string): number => {
    const numeric = value
      .replace(/[^0-9,.-]/g, '')
      .replace(',', '.');
    
    const parsed = parseFloat(numeric);
    if (Number.isNaN(parsed)) return 0;
    return Math.round(parsed * 100);
  };

  const totalCents = toCents(priceA) + toCents(priceB);
  const total = totalCents / 100;

  const formatted = total.toFixed(2).replace('.', ',');

  const hasDollar = priceA.includes('$') || priceB.includes('$');
  return `${formatted}${hasDollar ? '$' : ''}`;
}
