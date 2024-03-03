import EventIconSVG from 'assets/icons/event.svg';
import LockIconSVG from 'assets/icons/lock.svg';
import MapIconSVG from 'assets/icons/map.svg';
import classNames from 'classnames';
import Translate from 'client/translate';
import faqStyles from 'components/frequently-asked-questions/component.module.css';
import { FC } from 'react';
import { VerifiedGuestTokenPayload } from 'server/authenticator';

import styles from './component.module.css';

export interface EventDetailsComponentProps {
  token?: VerifiedGuestTokenPayload;
}

const EventDetailsComponent: FC<EventDetailsComponentProps> = ({ token }) => {
  if (!token) {
    return (
      <div className={faqStyles.faq}>
        <div className={faqStyles.faqTitle}>{Translate.t('components.event-details.title')}</div>
        <div className={classNames(faqStyles.faqQuestion, styles.header)}>
          <LockIconSVG />
          <span>{Translate.t('components.event-details.headers.locked')}</span>
        </div>
        <div className={faqStyles.faqAnswer}>{Translate.html('components.event-details.descriptions.locked')}</div>
      </div>
    );
  }

  return (
    <div className={faqStyles.faq}>
      <div className={faqStyles.faqTitle}>{Translate.t('components.event-details.title')}</div>
      <div className={classNames(faqStyles.faqQuestion, styles.header)}>
        <EventIconSVG />
        <span>{Translate.t('components.event-details.headers.date')}</span>
      </div>
      <div className={faqStyles.faqAnswer}>{Translate.t('components.event-details.descriptions.ceremony')}</div>
      <div className={classNames(faqStyles.faqQuestion, styles.header)}>
        <MapIconSVG />
        <span>{Translate.t('components.event-details.headers.venue')}</span>
      </div>
      <div className={faqStyles.faqAnswer}>
        <a href="https://maps.app.goo.gl/qwB4NwCU742cEDp36" target="_blank">
          {Translate.t('components.event-details.descriptions.address')}
        </a>
      </div>
    </div>
  );
};

export default EventDetailsComponent;
