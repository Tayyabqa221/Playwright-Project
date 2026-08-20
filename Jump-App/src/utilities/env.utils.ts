import * as fs from 'fs';
import * as path from 'path';

export function getEnvVariable(env: string, defaultValue?: string): string {
  const value = process.env[env];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${env} is not set`);
  }
  return value;
}

function findDataFile(dir: string, targetFile: string): null | string {
  if (!fs.existsSync(dir)) {
    return null;
  }
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const found = findDataFile(fullPath, targetFile);
      if (found) {
        return found;
      }
    } else if (file === targetFile) {
      return fullPath;
    }
  }
  return null;
}

function getDataRoot(): string {
  const fromDirname = path.resolve(__dirname, "../data");
  if (fs.existsSync(fromDirname)) return fromDirname;
  const fromCwd = path.resolve(process.cwd(), "src", "data");
  if (fs.existsSync(fromCwd)) return fromCwd;
  return fromCwd;
}

export function getDataSet(filename: string, datasetName: string, testCase: string) {
  const targetFile = `${filename}.data.ts`;
  const dataRoot = getDataRoot();
  const env = process.env.NODE_ENV || "staging";
  const envDir = path.join(dataRoot, env);
  const baseDir = fs.existsSync(envDir) ? envDir : dataRoot;
  const dataFilePath = findDataFile(baseDir, targetFile) || findDataFile(dataRoot, targetFile);

  if (!dataFilePath) {
    if (!fs.existsSync(dataRoot)) {
      throw new Error(`Data directory not found: ${dataRoot}.`);
    }
    throw new Error(`Data file not found: ${targetFile}. Searched in: ${baseDir}, ${dataRoot}`);
  }

  const dataModule = require(dataFilePath);

  // Check if the module has a function to get the data
  if (typeof dataModule.getData === 'function') {
    return dataModule.getData(testCase);
  }

  // Fallback to direct access if no function exists
  const data = dataModule[datasetName]?.[testCase];
  if (!data) {
    throw new Error(`Test case data not found for: ${testCase} in dataset: ${datasetName}`);
  }
  return data;
}
