import classNames from 'classnames';
import cookieBannerStyles from 'components/cookie-banner/component.module.css';
import useTranslate from 'hooks/translate';
import type { CSSProperties, FC, MouseEventHandler, RefObject } from 'react';
import { forwardRef } from 'react';

import styles from './component.module.css';

interface CookieModalProps {
  onClose: MouseEventHandler<HTMLButtonElement>;
  style?: CSSProperties;
}

const CookieModalComponent: FC<CookieModalProps> = forwardRef(({ onClose, style }, ref: RefObject<HTMLDivElement>) => {
  const t = useTranslate();

  return (
    <div className={styles.container} style={style}>
      <div className={styles.backdrop} />
      <div className={styles.modal} ref={ref}>
        <div className={styles.header}>
          <h1>{t('components.cookie-modal.title')}</h1>
          <p>{t('components.cookie-modal.description')}</p>
        </div>
        <div className={styles.group}>
          <h3>{t('components.cookie-modal.necessary.title')}</h3>
          <p>{t('components.cookie-modal.necessary.description')}</p>
        </div>
        <button className={classNames(cookieBannerStyles.closeButton, styles.closeButton)} onClick={onClose} />
      </div>
    </div>
  );
});

CookieModalComponent.displayName = 'CookieModalComponent';

export default CookieModalComponent;
