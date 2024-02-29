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
    </div>
  );
};

export default EventDetailsComponent;
