import "server-only";
import { compare, hash } from "bcryptjs";

const BCRYPT_ROUNDS = 12;

export function hashPassword(password: string): Promise<string> {
  return hash(password, BCRYPT_ROUNDS);
}

export function comparePassword(password: string, passwordHash: string): Promise<boolean> {
  return compare(password, passwordHash);
}
