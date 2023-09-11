import GuestListFlyout from 'components/flyouts/guest-list';
import RSVPFlyout from 'components/flyouts/rsvp';
import { FC } from 'react';
import { GuestTokenPayload } from 'server/authenticator';

import styles from './component.module.css';

interface NavigationBarComponentProps {
  token?: GuestTokenPayload;
}

const NavigationBarComponent: FC<NavigationBarComponentProps> = ({ token }) => {
  return (
    <div className={styles.navigationBar}>
      <div className={styles.navigationBarSpcaer} />
      {token ? <RSVPFlyout token={token} /> : <GuestListFlyout />}
    </div>
  );
};

export default NavigationBarComponent;
