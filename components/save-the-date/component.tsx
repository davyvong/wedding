import useTranslate from 'hooks/translate';
import type { FC } from 'react';

import styles from './component.module.css';

const SaveTheDateComponent: FC = () => {
  const t = useTranslate();

  return (
    <div className={styles.container}>
      <span>{t('components.save-the-date.hello-world')}</span>
    </div>
  );
};

export default SaveTheDateComponent;
