import EventIconSVG from 'assets/icons/event.svg';
import MapIconSVG from 'assets/icons/map.svg';
import classNames from 'classnames';
import Translate from 'client/translate';
import faqStyles from 'components/frequently-asked-questions/component.module.css';
import { FC, Fragment } from 'react';
import { VerifiedGuestTokenPayload } from 'server/authenticator';

import styles from './component.module.css';

export interface EventDetailsComponentProps {
  token?: VerifiedGuestTokenPayload;
}

const EventDetailsComponent: FC<EventDetailsComponentProps> = ({ token }) => {
  if (!token) {
    return <Fragment />;
  }

  return (
    <div className={faqStyles.faq}>
      <div className={faqStyles.faqTitle}>{Translate.t('components.event-details.title')}</div>
      <div className={classNames(faqStyles.faqQuestion, styles.header)}>
        <EventIconSVG />
        <span>{Translate.t('components.event-details.date')}</span>
      </div>
      <div className={faqStyles.faqAnswer}>{Translate.t('components.event-details.ceremony-time')}</div>
      <div className={classNames(faqStyles.faqQuestion, styles.header)}>
        <MapIconSVG />
        <span>{Translate.t('components.event-details.venue')}</span>
      </div>
      <div className={faqStyles.faqAnswer}>
        <a href="https://maps.app.goo.gl/qwB4NwCU742cEDp36" target="_blank">
          {Translate.t('components.event-details.venue-address')}
        </a>
      </div>
    </div>
  );
};

export default EventDetailsComponent;
