import classNames from 'classnames';
import { italiana } from 'client/fonts';
import Translate from 'client/translate';
import MegaMenu from 'components/mega-menu';
import Link from 'next/link';
import { FC } from 'react';
import { VerifiedGuestTokenPayload } from 'server/authenticator';

import styles from './component.module.css';

interface NavigationBarComponentProps {
  token?: VerifiedGuestTokenPayload;
}

const NavigationBarComponent: FC<NavigationBarComponentProps> = ({ token }) => (
  <div className={styles.navigationBar}>
    <Link className={classNames(styles.title, italiana.className)} href="/">
      {Translate.t('components.navigation-bar.title')}
    </Link>
    <MegaMenu token={token} />
  </div>
);

export default NavigationBarComponent;
