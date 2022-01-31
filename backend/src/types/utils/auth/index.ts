import * as dotenv from 'dotenv';
import { Context } from '../../../context';
import { verify, sign } from 'jsonwebtoken';
import { Country } from '@treedots/prisma';
dotenv.config();
const { JWT_SECRET } = process.env;
export const APP_SECRET = JWT_SECRET;

export interface UserCredentials {
  userId: number;
  userTypeId: number;
  buyerType: number;
  country?: Country;
}

export function getUserCredentials(context: Context): UserCredentials {
  const Authorization = context.request.req.get('Authorization');
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '');
    return verify(token, APP_SECRET) as UserCredentials;
  }

  return null;
}

export function getUserCredentialsByToken(authToken: string): UserCredentials {
  if ([null, undefined, 'null', 'undefined'].includes(authToken)) return null;
  try {
    const token = authToken.replace('Bearer ', '');
    return verify(token, APP_SECRET) as UserCredentials;
  } catch (error) {
    return null;
  }
}

export function generateJWT(payload: UserCredentials) {
  return sign(payload, APP_SECRET);
}
