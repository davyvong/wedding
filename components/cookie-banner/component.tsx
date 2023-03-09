import useTranslate from 'hooks/translate';
import { forwardRef } from 'react';
import type { CSSProperties, FC, MouseEventHandler, RefObject } from 'react';

import styles from './component.module.css';

interface CookieBannerProps {
  closeBanner: () => void;
  openModal: MouseEventHandler<HTMLAnchorElement>;
  style?: CSSProperties;
}

const CookieBannerComponent: FC<CookieBannerProps> = forwardRef(
  ({ closeBanner, openModal, style }, ref: RefObject<HTMLDivElement>) => {
    const t = useTranslate();

    return (
      <div className={styles.banner} ref={ref} style={style}>
        <p>
          {t('components.cookie-banner.description') + ' '}
          <a onClick={openModal}>{t('components.cookie-banner.learn-more')}</a>
        </p>
        <button className={styles.closeButton} onClick={closeBanner} />
      </div>
    );
  },
);

CookieBannerComponent.displayName = 'CookieBannerComponent';

export default CookieBannerComponent;
