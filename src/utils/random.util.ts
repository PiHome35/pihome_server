import { randomBytes } from 'crypto';

export function generateRandomSecret(nBytes: number = 32): string {
  return randomBytes(nBytes).toString('hex');
}
