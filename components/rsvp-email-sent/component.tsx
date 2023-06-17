'use client';

import InboxEmailOpenedSVG from 'assets/inbox-email-opened.svg';
import rsvpEmailCheckStyles from 'components/rsvp-email-check/component.module.css';
import useTranslate from 'hooks/translate';
import type { FC } from 'react';

import styles from './component.module.css';

interface RSVPEmailSentProps {
  email: string;
}

const RSVPEmailSent: FC<RSVPEmailSentProps> = ({ email }) => {
  const t = useTranslate();

  return (
    <div className={rsvpEmailCheckStyles.container}>
      <div className={rsvpEmailCheckStyles.innerContainer}>
        <div className={rsvpEmailCheckStyles.heading}>{t('components.rsvp-email-sent.heading')}</div>
        <div className={rsvpEmailCheckStyles.subheading}>
          <span>{t('components.rsvp-email-sent.subheading1', { email })} </span>
          <span>{t('components.rsvp-email-sent.subheading2')}</span>
        </div>
        <div className={styles.illustration}>
          <InboxEmailOpenedSVG />
        </div>
      </div>
    </div>
  );
};

export default RSVPEmailSent;
