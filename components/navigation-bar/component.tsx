import classNames from 'classnames';
import { italiana } from 'client/fonts';
import Translate from 'client/translate';
import InvitationFlyout from 'components/flyouts/invitation';
import RSVPFlyout from 'components/flyouts/rsvp';
import { FC } from 'react';
import { GuestTokenPayload } from 'server/authenticator';

import styles from './component.module.css';

interface NavigationBarComponentProps {
  token?: GuestTokenPayload;
}

const NavigationBarComponent: FC<NavigationBarComponentProps> = async ({ token }) => (
  <div className={styles.navigationBar}>
    <div className={classNames(styles.title, italiana.className)}>{Translate.t('components.navigation-bar.title')}</div>
    {token ? <RSVPFlyout defaultSelectedGuestId={token.guestId} /> : <InvitationFlyout />}
  </div>
);

export default NavigationBarComponent;
