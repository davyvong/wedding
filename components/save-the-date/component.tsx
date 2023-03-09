import useTranslate from 'hooks/translate';
import type { FC } from 'react';

import styles from './component.module.css';

const SaveTheDateComponent: FC = () => {
  const t = useTranslate();

  return (
    <div className={styles.container}>
      <span>{t('app.layout.title')}</span>
    </div>
  );
};

export default SaveTheDateComponent;
