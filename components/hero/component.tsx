import useTranslate from 'hooks/translate';
import type { FC } from 'react';

import styles from './component.module.css';

const HeroComponent: FC = () => {
  const t = useTranslate();

  return (
    <div className={styles.container}>
      <span>{t('components.hero.hello-world')}</span>
    </div>
  );
};

export default HeroComponent;
