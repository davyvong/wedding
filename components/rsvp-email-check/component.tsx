'use client';

import { useCallback, useMemo, useState } from 'react';
import type { FC } from 'react';

import styles from './component.module.css';

const RSVPEmailCheck: FC = () => {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [hasSent, setHasSent] = useState(false);

  const sendLoginCode = useCallback(async (): Promise<void> => {
    setIsSending(true);
    await fetch('/api/auth/email', {
      body: JSON.stringify({ email }),
      cache: 'no-store',
      method: 'POST',
    });
    setIsSending(false);
    setHasSent(true);
  }, [email]);

  const sendButtonText = useMemo(() => {
    if (isSending) {
      return 'Sending email code...';
    }
    if (hasSent) {
      return 'Email code sent!';
    }
    return 'Send email code';
  }, [hasSent, isSending]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div>Instructions</div>
        <input
          className={styles.emailInput}
          onChange={event => setEmail(event.target.value)}
          placeholder="Email address"
          value={email}
        />
        <button className={styles.sendButton} disabled={!email} onClick={sendLoginCode}>
          {sendButtonText}
        </button>
      </div>
    </div>
  );
};

export default RSVPEmailCheck;
