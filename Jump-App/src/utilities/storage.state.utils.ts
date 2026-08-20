export function getStorageStatePath(name: string): string {
  const paths: { [key: string]: string } = {
    jumpappGoogle: './jumpapp-google-auth.json',
  };

  const path = paths[name];
  if (!path) {
    throw new Error(`No storage state path found for: ${name}`);
  }
  return path;
}