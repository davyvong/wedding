'use server';

import { cookies } from 'next/headers';

export const clearTokenCookie = (): void => {
  cookies().set({
    expires: new Date(),
    name: 'token',
    path: '/',
    value: '',
  });
};
