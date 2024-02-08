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

interface InvitationFlyoutComponentProps extends FlyoutContentComponentProps {}

const InvitationFlyoutComponent: FC<InvitationFlyoutComponentProps> = ({ setIsOpen }) => {
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
        setError('components.flyouts.invitation.errors.missing-email');
        return;
      } else if (!string().email().required().isValidSync(email)) {
        setError('components.flyouts.invitation.errors.invalid-email');
        return;
      }
      setIsSending(true);
      const response = await fetch('/api/secret/email', {
        body: JSON.stringify({ email: email.toLowerCase() }),
        cache: 'no-store',
        method: 'POST',
      });
      setIsSending(false);
      if (!response.ok) {
        setError('components.flyouts.invitation.errors.not-invited');
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
      return <span>{Translate.t('components.flyouts.invitation.buttons.send-again')}</span>;
    }
    if (isSending) {
      return (
        <Fragment>
          <div className={rsvpFlyoutStyles.submitButtonLoading}>
            <LoadingHeart className={rsvpFlyoutStyles.submitButtonLoadingHeart} inverse />
          </div>
          <span>{Translate.t('components.flyouts.invitation.buttons.sending')}</span>
        </Fragment>
      );
    }
    return <span>{Translate.t('components.flyouts.invitation.buttons.send-secret-link')}</span>;
  }, [isSending, isSent]);

  return (
    <form className={rsvpFlyoutStyles.content} onSubmit={sendLoginCode}>
      <div className={rsvpFlyoutStyles.title}>{Translate.t('components.flyouts.invitation.title')}</div>
      <div className={rsvpFlyoutStyles.question}>{Translate.t('components.flyouts.invitation.description')}</div>
      <TextInput
        inverse
        onChange={(event): void => setEmail(event.target.value)}
        placeholder={Translate.t('components.flyouts.invitation.placeholders.email')}
        readOnly={isSending}
        value={email}
      />
      {error && <div className={rsvpFlyoutStyles.error}>{Translate.html(error)}</div>}
      {isSent && (
        <div className={styles.success}>
          {Translate.html('components.flyouts.invitation.messages.email-sent', { email })}
        </div>
      )}
      <div className={rsvpFlyoutStyles.buttons}>
        <Button className={rsvpFlyoutStyles.submitButton} disabled={isSending} inverse type="submit">
          {renderSubmitButtonContent()}
        </Button>
        <Button inverse onClick={() => setIsOpen(false)}>
          {isSent
            ? Translate.t('components.flyouts.invitation.buttons.close')
            : Translate.t('components.flyouts.invitation.buttons.cancel')}
        </Button>
      </div>
    </form>
  );
};

export default InvitationFlyoutComponent;
