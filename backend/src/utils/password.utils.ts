import bcrypt from 'bcryptjs';
import { env } from '../config/env';

export const hashPassword = async (plain: string): Promise<string> =>
  bcrypt.hash(plain, env.BCRYPT_ROUNDS);

export const comparePassword = async (plain: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plain, hash);
