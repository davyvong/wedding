import Background1IWEBP from 'assets/images/scavenger-hunt/background-1.webp';
import Background2PNG from 'assets/images/scavenger-hunt/background-2.png';
import Background3PNG from 'assets/images/scavenger-hunt/background-3.png';
import CameraWEBP from 'assets/images/scavenger-hunt/camera.webp';
import HeartFilledWEBP from 'assets/images/scavenger-hunt/heart-filled.webp';
import HeartEmptyWEBP from 'assets/images/scavenger-hunt/heart.webp';
import classNames from 'classnames';
import { apricots, vidaloka } from 'client/fonts';
import Translate from 'client/translate';
import Image from 'next/image';
import { FC, useCallback } from 'react';

import styles from './component.module.css';
import { scanvengerHuntItems } from './constants';

const ScavengerHuntComponent: FC = () => {
  const renderItem = useCallback((item, index: number): JSX.Element => {
    const isCompleted = index === 0;
    return (
      <div className={classNames(styles.item, isCompleted && styles.itemCompleted)}>
        <Image
          alt={item.name}
          className={styles.heart}
          src={isCompleted ? HeartFilledWEBP : HeartEmptyWEBP}
          width={32}
        />
        <span>
          {item.name}{' '}
          {isCompleted && (
            <span className={styles.itemHint}>{Translate.t('components.scavenger-hunt.completed-hint')}</span>
          )}
        </span>
      </div>
    );
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Image alt="" className={styles.background1} priority src={Background1IWEBP} />
        <Image alt="" className={styles.background2} priority src={Background2PNG} />
        <Image alt="" className={styles.background3} priority src={Background3PNG} />
        <div className={classNames(styles.pretitle, apricots.className)}>
          <Image alt="" className={styles.camera} height={40} priority src={CameraWEBP} />
          <span>{Translate.t('components.scavenger-hunt.pretitle')}</span>
          <Image alt="" className={styles.camera} height={40} priority src={CameraWEBP} />
        </div>
        <div className={classNames(styles.title, vidaloka.className)}>
          {Translate.t('components.scavenger-hunt.title')}
        </div>
        {scanvengerHuntItems.map(renderItem)}
        <div className={classNames(styles.instructions, vidaloka.className)}>
          {Translate.t('components.scavenger-hunt.instructions')}
        </div>
      </div>
    </div>
  );
};

export default ScavengerHuntComponent;
