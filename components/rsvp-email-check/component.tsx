'use client';

import LoadingHeart from 'components/loading-heart';
import useTranslate from 'hooks/translate';
import { useCallback, useState } from 'react';
import type { FC, FormEvent } from 'react';
import { string } from 'yup';

import styles from './component.module.css';

const RSVPEmailCheck: FC = () => {
  const t = useTranslate();

  const [email, setEmail] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [hasSent, setHasSent] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  const sendLoginCode = useCallback(
    async (event: FormEvent): Promise<void> => {
      event.preventDefault();
      if (!email) {
        setError(new Error(t('components.rsvp-email-check.errors.missing-email')));
        return;
      } else if (!string().email().required().isValidSync(email)) {
        setError(new Error(t('components.rsvp-email-check.errors.invalid-email')));
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
        setError(new Error(t('components.rsvp-email-check.errors.not-invited')));
      } else {
        setHasSent(true);
      }
    },
    [email, error, t],
  );

  if (hasSent) {
    return (
      <div className={styles.container}>
        <div className={styles.successCard}>
          <div className={styles.heading}>{t('components.rsvp-email-check.success.heading')}</div>
          <div className={styles.subheading}>
            <span>{t('components.rsvp-email-check.success.subheading1', { email })} </span>
            <span>{t('components.rsvp-email-check.success.subheading2')}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <form className={styles.formCard} onSubmit={sendLoginCode}>
        <div>{t('components.rsvp-email-check.form.description')}</div>
        <input
          className={styles.emailInput}
          onChange={event => setEmail(event.target.value)}
          placeholder="Email"
          value={email}
        />
        {error && <div className={styles.errorMessage}>{error.message}</div>}
        <button className={styles.sendButton} disabled={isSending} onClick={sendLoginCode}>
          {isSending ? <LoadingHeart /> : t('components.rsvp-email-check.form.send-button')}
        </button>
      </form>
    </div>
  );
};

export default RSVPEmailCheck;
