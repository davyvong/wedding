import classNames from 'classnames';
import { italiana } from 'client/fonts';
import Translate from 'client/translate';
import MegaMenu from 'components/mega-menu';
import { FC } from 'react';
import { GuestTokenPayload } from 'server/authenticator';

import styles from './component.module.css';

interface NavigationBarComponentProps {
  token?: GuestTokenPayload;
}

const NavigationBarComponent: FC<NavigationBarComponentProps> = async ({ token }) => (
  <div className={styles.navigationBar}>
    <div className={classNames(styles.title, italiana.className)}>{Translate.t('components.navigation-bar.title')}</div>
    <MegaMenu token={token} />
  </div>
);

export default NavigationBarComponent;
