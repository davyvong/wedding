import classNames from 'classnames';
import { italiana } from 'client/fonts';
import Translate from 'client/translate';
import GuestListFlyout from 'components/flyouts/invitation';
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
      <div className={classNames(styles.title, italiana.className)}>{Translate.t('app.layout.title')}</div>
      <div className={styles.spacer} />
      {token ? <RSVPFlyout token={token} /> : <GuestListFlyout />}
    </div>
  );
};

export default NavigationBarComponent;
