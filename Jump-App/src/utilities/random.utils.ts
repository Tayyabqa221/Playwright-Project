import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// generate random first name
export const generateRandomFirstName = (): string => {
  return faker.person.firstName();
};

// generate random last name
export const generateRandomLastName = (): string => {
  return faker.person.lastName();
};

// generate random company name
export const generateRandomCompanyName = (): string => {
  return faker.company.name();
};

export function generateRandomId(length: number = 5): string {
  return faker.string.alpha({ length, casing: 'lower' });
}

export const generateRandomText = (wordCount: number = 3): string => {
  return faker.lorem.words(wordCount);
};

/**
 * Generates a random number with the specified number of digits.
 *
 * @param digits - The number of digits for the generated number.
 * @returns - A random number with the specified number of digits.
 * @throws {Error} - If the number of digits is less than or equal to zero.
 */
export const generateRandomNumber = (digits: number): string => {
  if (digits <= 0 || digits > 15) {
    throw new Error('Invalid number of digits. Please provide a number between 1 and 15.');
  }

  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;

  return `${faker.number.int({ max, min })}`;
};

export const generateUniqueId = (): string => {
  return uuidv4();
};

export const generateRandomAlphanumeric = (length: number): string => {
  if (length <= 0 || length > 50) {
    // You can adjust the max length as needed
    throw new Error('Invalid length. Please provide a number between 1 and 50.');
  }

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = faker.number.int({ max: characters.length - 1, min: 0 });
    result += characters[randomIndex];
  }

  return result;
};

export const removeTrailingSlash = (value: string): string => {
  return value.replace(/\/$/, '');
};

/**
 * Generates a random email using the Mailosaur domain.
 *
 * @returns - A randomly generated email address.
 */
export const generateRandomEmailAddress = (): string => {
  const randomString = faker.string.alphanumeric(8);
  const mailosaurDomain = process.env.mailosaurDomain;
  return `${randomString}@${mailosaurDomain}`;
};

/**
 * Generates a random email subject.
 *
 * @returns - A randomly generated email subject.
 */
export const generateRandomEmailSubject = (): string => {
  return faker.lorem.sentence(5); // Generates a random sentence with 5 words
};

/**
 * Generates a random email body.
 *
 * @returns - A randomly generated email body.
 */
export const generateRandomEmailBody = (): string => {
  return faker.lorem.paragraphs(1);
};

export function generateNodeString(node: string, maxLength?: number): string {
  const sessionPrefix = `${process.env.TEST_SESSION_ID} -`;
  const pagePrefix = node.substring(0, 4);
  let title = `${sessionPrefix} ${pagePrefix} ${generateRandomId()}`;
  return maxLength ? title.substring(0, maxLength) : title;
}

export const generateRandomEmail = (): string => {
  const randomString = faker.string.alphanumeric(8);
  const mailosaurDomain = process.env.mailosaurDomain;
  const domain = mailosaurDomain?.includes('.') ? mailosaurDomain : `${mailosaurDomain}.com`;
  return `${randomString}@${domain}`;
};

/**
 * List of all available industry types for community registration
 */
export const INDUSTRY_TYPES = [
  'Accounting',
  'Advertising',
  'Aerospace and Defense',
  'Agriculture',
  'Architecture',
  'Architecture and Planning',
  'Artificial Intelligence (AI)',
  'Automotive',
  'Banking',
  'Biotechnology',
  'Chemicals',
  'Clean Technology',
  'Construction',
  'Consulting Services',
  'Consumer Electronics',
  'Consumer Goods',
  'Cybersecurity',
  'E-commerce',
  'Education',
  'Energy and Utilities',
  'Environmental Services',
  'Event Management',
  'Fashion and Apparel',
  'Film and Animation',
  'Finance',
  'Financial Technology (Fintech)',
  'Fitness and Wellness',
  'Food and Beverage',
  'Gaming and Entertainment',
  'Graphic Design',
  'Healthcare',
  'Healthcare IT',
  'Hospitality and Tourism',
  'Human Resources',
  'Information Technology (IT)',
  'Insurance',
  'Interior Design',
  'Legal Services',
  'Logistics',
  'Manufacturing',
  'Market Research',
  'Media and Entertainment',
  'Metals and Mining',
  'Nanotechnology',
  'Nonprofit and Social Services',
  'Oil and Gas',
  'Personal Care and Beauty',
  'Pharmaceuticals',
  'Photography',
  'Public Relations',
  'Real Estate',
  'Renewable Energy',
  'Research and Development',
  'Retail',
  'Robotics and Automation',
  'Social Media and Networking',
  'Social Services',
  'Software Development',
  'Space Exploration',
  'Sports and Recreation',
  'Telecommunications',
  'Textile',
  'Tourism',
  'Transportation',
  'Travel',
  'Venture Capital',
  'Virtual Reality (VR)',
  'Water Management',
  'Web Development',
] as const;

/**
 *
 * @returns - A random industry type string.
 */
export const generateRandomIndustryType = (): string => {
  const randomIndex = faker.number.int({ min: 0, max: INDUSTRY_TYPES.length - 1 });
  return INDUSTRY_TYPES[randomIndex];
};
