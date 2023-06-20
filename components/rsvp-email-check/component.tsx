'use client';

import classNames from 'classnames';
import LoadingHeart from 'components/loading-heart';
import useTranslate from 'hooks/translate';
import { useCallback, useState } from 'react';
import type { FC, FormEvent } from 'react';
import { string } from 'yup';

import styles from './component.module.css';

const RSVPEmailCheck: FC = () => {
  const { html, t } = useTranslate();

  const [email, setEmail] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
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
      if (response.status === 401) {
        setIsSending(false);
        setError(new Error(t('components.rsvp-email-check.errors.not-invited')));
      } else {
        const redirectURL = new URL(window.location.origin);
        redirectURL.pathname = '/auth/email-sent';
        redirectURL.searchParams.set('email', email);
        window.location.href = redirectURL.href;
      }
    },
    [email, error, t],
  );

  return (
    <div className={styles.container}>
      <form className={styles.innerContainer} onSubmit={sendLoginCode}>
        <div className={styles.heading}>{t('app.layout.title')}</div>
        <div className={styles.subheading}>{t('components.rsvp-email-check.form.description')}</div>
        <input
          className={styles.emailInput}
          onChange={event => setEmail(event.target.value)}
          placeholder="Email"
          value={email}
        />
        {error && <div className={styles.errorMessage}>{html(error.message)}</div>}
        <button
          className={classNames(styles.sendButton, isSending && styles.sendButtonLoading)}
          disabled={isSending}
          onClick={sendLoginCode}
        >
          {isSending ? <LoadingHeart /> : t('components.rsvp-email-check.form.send-button')}
        </button>
      </form>
    </div>
  );
};

export default RSVPEmailCheck;
