import useTranslate from 'hooks/translate';
import type { CSSProperties, FC, RefObject } from 'react';
import { forwardRef } from 'react';

import styles from './component.module.css';

interface CookieBannerProps {
  closeBanner: () => void;
  style?: CSSProperties;
}

const CookieBannerComponent: FC<CookieBannerProps> = forwardRef(
  ({ closeBanner, style }, ref: RefObject<HTMLDivElement>) => {
    const t = useTranslate();

    return (
      <div className={styles.banner} ref={ref} style={style}>
        <p className={styles.description}>
          {t('components.cookie-banner.description') + ' '}
          <a>{t('components.cookie-banner.learn-more')}</a>
        </p>
        <button className={styles.button} onClick={closeBanner}>
          {t('components.cookie-banner.ok')}
        </button>
      </div>
    );
  },
);

CookieBannerComponent.displayName = 'CookieBannerComponent';

export default CookieBannerComponent;
