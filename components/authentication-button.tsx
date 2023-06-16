'use client';

import { useCallback } from 'react';
import type { FC } from 'react';

const AuthenticationButton: FC = () => {
  const sendAuthenticationEmail = useCallback(
    (email: string): Promise<Response> =>
      fetch('/api/auth/email', {
        body: JSON.stringify({ email }),
        method: 'POST',
      }),
    [],
  );

  return <button onClick={() => sendAuthenticationEmail('davy.vong@gmail.com')}>sendAuthenticationEmail</button>;
};

export default AuthenticationButton;
