'use client';

import InboxEmailOpenedSVG from 'assets/inbox-email-opened.svg';
import classNames from 'classnames';
import secretLinkFormStyles from 'components/secret-link-form/component.module.css';
import useTranslate from 'hooks/translate';
import type { FC } from 'react';

import styles from './component.module.css';

interface SecretLinkSentProps {
  email?: string;
}

const SecretLinkSent: FC<SecretLinkSentProps> = ({ email }) => {
  const { html, t } = useTranslate();

  return (
    <div className={secretLinkFormStyles.container}>
      <div className={secretLinkFormStyles.innerContainer}>
        <div className={secretLinkFormStyles.heading}>{t('components.secret-link-sent.heading')}</div>
        <div className={classNames(secretLinkFormStyles.subheading, styles.subheadingEmail)}>
          {email
            ? html('components.secret-link-sent.subheading-with-email', { email })
            : html('components.secret-link-sent.subheading-without-email')}
        </div>
        <div className={styles.illustration}>
          <InboxEmailOpenedSVG />
        </div>
      </div>
    </div>
  );
};

export default SecretLinkSent;
