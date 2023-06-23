'use server';

import { cookies } from 'next/headers';

export const clearTokenCookie = () => {
  cookies().set({
    expires: new Date(),
    name: 'token',
    path: '/',
    value: '',
  });
};
