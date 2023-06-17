'use client';

import { useCallback, useState } from 'react';
import type { FC, FormEvent } from 'react';
import { string } from 'yup';

import styles from './component.module.css';

const RSVPEmailCheck: FC = () => {
  const [email, setEmail] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [hasSent, setHasSent] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  const sendLoginCode = useCallback(
    async (event: FormEvent): Promise<void> => {
      event.preventDefault();
      if (!email) {
        setError(new Error('Please fill in your email address.'));
        return;
      } else if (!string().email().required().isValidSync(email)) {
        setError(new Error('The email address should be formatted like username@domain.com'));
        return;
      } else if (error) {
        setError(undefined);
      }
      setIsSending(true);
      const response = await fetch('/api/auth/email', {
        body: JSON.stringify({ email }),
        cache: 'no-store',
        method: 'POST',
      });
      setIsSending(false);
      if (response.status === 401) {
        setError(new Error('Your email was not found on the guest list. Let the host know.'));
      } else {
        setHasSent(true);
      }
    },
    [email, error],
  );

  if (hasSent) {
    return (
      <div className={styles.container}>
        <div className={styles.successStage}>
          <div className={styles.heading}>Check your email</div>
          <div className={styles.subheading}>
            We have sent an email to you at <u>{email}</u>.<br />
            It has a secret link to your invitation.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={sendLoginCode}>
        <div>Get a secret link sent to your email to view your RSVP invitation.</div>
        <input
          className={styles.field}
          onChange={event => setEmail(event.target.value)}
          placeholder="Email"
          value={email}
        />
        {error && <div className={styles.field}>{error.message}</div>}
        <button className={styles.field} disabled={isSending} onClick={sendLoginCode}>
          {isSending ? 'Sending secret link...' : 'Send secret link'}
        </button>
      </form>
    </div>
  );
};

export default RSVPEmailCheck;
