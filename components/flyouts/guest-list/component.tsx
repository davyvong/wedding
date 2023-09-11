'use client';

import Translate from 'client/translate';
import Button from 'components/button';
import type { FlyoutContentComponentProps } from 'components/flyout/component';
import rsvpFlyoutStyles from 'components/flyouts/rsvp/component.module.css';
import TextInput from 'components/form/text-input';
import LoadingHeart from 'components/loading-heart';
import { Fragment, useCallback, useState } from 'react';
import type { FC, FormEvent } from 'react';
import { string } from 'yup';

import styles from './component.module.css';

interface GuestListFlyoutComponentProps extends FlyoutContentComponentProps {}

const GuestListFlyoutComponent: FC<GuestListFlyoutComponentProps> = ({ setIsOpen }) => {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>();
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isSent, setIsSent] = useState<boolean>(false);

  const sendLoginCode = useCallback(
    async (event: FormEvent): Promise<void> => {
      event.preventDefault();
      if (isSent) {
        return;
      }
      if (!email) {
        setError('components.flyouts.guest-list.errors.missing-email');
        return;
      } else if (!string().email().required().isValidSync(email)) {
        setError('components.flyouts.guest-list.errors.invalid-email');
        return;
      }
      setIsSending(true);
      const response = await fetch('/api/secret/email', {
        body: JSON.stringify({ email: email.toLowerCase() }),
        cache: 'no-store',
        method: 'POST',
      });
      setIsSending(false);
      if (response.status === 401) {
        setError('components.flyouts.guest-list.errors.not-invited');
        return;
      }
      if (error) {
        setError(undefined);
      }
      setIsSent(true);
    },
    [email, error, isSent],
  );

  const renderSubmitButtonContent = useCallback((): JSX.Element => {
    if (isSent) {
      return <span>{Translate.t('components.flyouts.guest-list.buttons.send-again')}</span>;
    }
    if (isSending) {
      return (
        <Fragment>
          <div className={rsvpFlyoutStyles.submitButtonLoading}>
            <LoadingHeart className={rsvpFlyoutStyles.submitButtonLoadingHeart} inverse />
          </div>
          <span>{Translate.t('components.flyouts.guest-list.buttons.sending')}</span>
        </Fragment>
      );
    }
    return <span>{Translate.t('components.flyouts.guest-list.buttons.send-secret-link')}</span>;
  }, [isSending, isSent]);

  return (
    <form className={rsvpFlyoutStyles.form} onSubmit={sendLoginCode}>
      <div className={rsvpFlyoutStyles.title}>{Translate.t('components.flyouts.guest-list.title')}</div>
      <div className={rsvpFlyoutStyles.question}>{Translate.t('components.flyouts.guest-list.description')}</div>
      <TextInput
        inverse
        onChange={(event): void => setEmail(event.target.value)}
        placeholder={Translate.t('components.flyouts.guest-list.placeholders.email')}
        readOnly={isSent}
        value={email}
      />
      {error && <div className={rsvpFlyoutStyles.error}>{Translate.html(error)}</div>}
      {isSent && (
        <div className={styles.success}>
          {Translate.html('components.flyouts.guest-list.messages.email-sent', { email })}
        </div>
      )}
      <div className={rsvpFlyoutStyles.buttons}>
        <Button className={rsvpFlyoutStyles.submitButton} disabled={isSending} inverse type="submit">
          {renderSubmitButtonContent()}
        </Button>
        <Button inverse onClick={() => setIsOpen(false)}>
          {isSent
            ? Translate.t('components.flyouts.guest-list.buttons.close')
            : Translate.t('components.flyouts.guest-list.buttons.cancel')}
        </Button>
      </div>
    </form>
  );
};

export default GuestListFlyoutComponent;
