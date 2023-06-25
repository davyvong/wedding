'use client';

import classNames from 'classnames';
import LoadingHeart from 'components/loading-heart';
import useTranslate from 'hooks/translate';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { FC, FormEvent } from 'react';
import { string } from 'yup';

import styles from './component.module.css';

const SecretLinkForm: FC = () => {
  const router = useRouter();
  const { html, t } = useTranslate();

  const [email, setEmail] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  const sendLoginCode = useCallback(
    async (event: FormEvent): Promise<void> => {
      event.preventDefault();
      if (!email) {
        setError(new Error('components.secret-link-form.errors.missing-email'));
        return;
      } else if (!string().email().required().isValidSync(email)) {
        setError(new Error('components.secret-link-form.errors.invalid-email'));
        return;
      } else if (error) {
        setError(undefined);
      }
      setIsSending(true);
      const response = await fetch('/api/secret-link/email', {
        body: JSON.stringify({ email: email.toLowerCase() }),
        cache: 'no-store',
        method: 'POST',
      });
      setIsSending(false);
      if (response.status === 401) {
        setError(new Error('components.secret-link-form.errors.not-invited'));
      } else {
        router.push('/secret-link/sent?to=' + email.toLowerCase());
      }
    },
    [email, error, router],
  );

  return (
    <div className={styles.container}>
      <form className={styles.innerContainer} onSubmit={sendLoginCode}>
        <div className={styles.heading}>{t('app.layout.title')}</div>
        <div className={styles.subheading}>{t('components.secret-link-form.description')}</div>
        <input
          className={classNames(styles.emailInput, error && styles.emailInputError)}
          onChange={event => setEmail(event.target.value)}
          placeholder="Email"
          value={email}
        />
        {error && <div className={styles.errorMessage}>{html(error.message)}</div>}
        <button
          aria-label={t('components.secret-link-form.send-button')}
          className={classNames(styles.sendButton, isSending && styles.sendButtonLoading)}
          disabled={isSending}
          onClick={sendLoginCode}
        >
          {isSending ? <LoadingHeart /> : t('components.secret-link-form.send-button')}
        </button>
      </form>
    </div>
  );
};

export default SecretLinkForm;
