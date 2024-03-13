'use server';

import { cookies } from 'next/headers';
import JWT from 'server/tokens/jwt';
import { object, string } from 'yup';

export interface ScavengerHuntTokenPayload {
  username: string;
}

export const signScavengerHuntToken = async (payload: ScavengerHuntTokenPayload): Promise<string | undefined> => {
  const payloadSchema = object({
    username: string()
      .max(24)
      .min(3)
      .matches(/^[a-zA-Z0-9_]*$/)
      .required(),
  });
  if (!payloadSchema.isValidSync(payload)) {
    // TODO: Return schema validation failed message
    return '';
  }
  // TODO: Check username availability
  const expiresIn1Year = 31536000;
  const token = await JWT.sign({ username: payload.username }, expiresIn1Year);
  const expiryDate = new Date(Date.now() + expiresIn1Year * 1000);
  cookies().set('token_sh', token, { expires: expiryDate });
};
