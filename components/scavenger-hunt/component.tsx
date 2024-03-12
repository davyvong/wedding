import Background1IWEBP from 'assets/images/scavenger-hunt/background-1.webp';
import Background2PNG from 'assets/images/scavenger-hunt/background-2.png';
import Background3PNG from 'assets/images/scavenger-hunt/background-3.png';
import CameraWEBP from 'assets/images/scavenger-hunt/camera.webp';
import HeartFilledWEBP from 'assets/images/scavenger-hunt/heart-filled.webp';
import HeartEmptyWEBP from 'assets/images/scavenger-hunt/heart.webp';
import classNames from 'classnames';
import { apricots, vidaloka } from 'client/fonts';
import Translate from 'client/translate';
import ScavengerHuntUploader from 'components/scavenger-hunt/uploader';
import { JWTPayload } from 'jose';
import Image from 'next/image';
import { FC, useCallback } from 'react';

import styles from './component.module.css';
import { ScavengerHuntTask, scavengerHuntTasks } from './constants';

interface ScavengerHuntComponentProps {
  token?: JWTPayload;
}

const ScavengerHuntComponent: FC<ScavengerHuntComponentProps> = () => {
  const renderTask = useCallback((task: ScavengerHuntTask): JSX.Element => {
    const isCompleted = false;
    return (
      <div className={classNames(styles.task, isCompleted && styles.taskCompleted)}>
        <Image
          alt={task.name}
          className={styles.heart}
          src={isCompleted ? HeartFilledWEBP : HeartEmptyWEBP}
          width={32}
        />
        <ScavengerHuntUploader disabled={isCompleted} task={task} />
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
        {scavengerHuntTasks.map(renderTask)}
        <div className={classNames(styles.instructions, vidaloka.className)}>
          {Translate.t('components.scavenger-hunt.instructions')}
        </div>
      </div>
    </div>
  );
};

export default ScavengerHuntComponent;
