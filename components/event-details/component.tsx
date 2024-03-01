import Translate from 'client/translate';
import faqStyles from 'components/frequently-asked-questions/component.module.css';
import { FC, Fragment } from 'react';
import { VerifiedGuestTokenPayload } from 'server/authenticator';

export const runtime = 'edge';

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
      <div className={faqStyles.faqQuestion}>{Translate.t('components.event-details.date')}</div>
      <div className={faqStyles.faqAnswer}>{Translate.t('components.event-details.ceremony-time')}</div>
      <div className={faqStyles.faqQuestion}>{Translate.t('components.event-details.venue')}</div>
      <div className={faqStyles.faqAnswer}>
        <a href="https://maps.app.goo.gl/qwB4NwCU742cEDp36" target="_blank">
          {Translate.t('components.event-details.venue-address')}
        </a>
      </div>
    </div>
  );
};

export default EventDetailsComponent;
