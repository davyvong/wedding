import useTranslate from 'hooks/translate';
import { Fragment } from 'react';
import type { FC, MouseEventHandler, RefObject } from 'react';

import styles from './component.module.css';

interface CookieBannerProps {
  closeBanner: () => void;
  hasPreferences: boolean;
  isOpen: boolean;
  modalRef: RefObject<HTMLDivElement>;
  openModal: MouseEventHandler<HTMLAnchorElement>;
}

const CookieBannerComponent: FC<CookieBannerProps> = props => {
  const { closeBanner, hasPreferences, isOpen, modalRef, openModal } = props;

  const t = useTranslate();

  if (hasPreferences) {
    return <Fragment />;
  }

  if (isOpen) {
    return (
      <div className={styles.modal} ref={modalRef}>
        <div className={styles.modalHeader}>
          <h1>{t('components.cookie-banner.modal.title')}</h1>
          <p>{t('components.cookie-banner.description')}</p>
        </div>
        <div className={styles.modalGroup}>
          <h3>{t('components.cookie-banner.modal.necessary.title')}</h3>
          <p>{t('components.cookie-banner.modal.necessary.description')}</p>
        </div>
        <button className={styles.closeButton} onClick={closeBanner} />
      </div>
    );
  }

  return (
    <div className={styles.banner}>
      <p>
        {t('components.cookie-banner.description') + ' '}
        <a onClick={openModal}>{t('components.cookie-banner.learn-more')}</a>
      </p>
      <button className={styles.closeButton} onClick={closeBanner} />
    </div>
  );
};

export default CookieBannerComponent;
