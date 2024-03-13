'use client';

import Background1IWEBP from 'assets/images/scavenger-hunt/background-1.webp';
import Background2PNG from 'assets/images/scavenger-hunt/background-2.png';
import Background3PNG from 'assets/images/scavenger-hunt/background-3.png';
import CameraWEBP from 'assets/images/scavenger-hunt/camera.webp';
import classNames from 'classnames';
import { apricots, vidaloka } from 'client/fonts';
import Translate from 'client/translate';
import ScavengerHuntTaskComponent from 'components/scavenger-hunt-task';
import ScavengerHuntUsername from 'components/scavenger-hunt-username';
import { JWTPayload } from 'jose';
import Image from 'next/image';
import { FC, useState } from 'react';

import styles from './component.module.css';
import { ScavengerHuntTask, scavengerHuntTasks } from './constants';

interface ScavengerHuntComponentProps {
  token?: JWTPayload;
}

const ScavengerHuntComponent: FC<ScavengerHuntComponentProps> = ({ token }) => {
  const [hasUsername, setHasUsername] = useState<boolean>(!!token);

  if (!hasUsername) {
    return <ScavengerHuntUsername setHasUsername={setHasUsername} />;
  }

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
        {scavengerHuntTasks.map((task: ScavengerHuntTask) => (
          <ScavengerHuntTaskComponent {...task} key={task.id} />
        ))}
        <div className={classNames(styles.instructions, vidaloka.className)}>
          {Translate.t('components.scavenger-hunt.instructions')}
        </div>
      </div>
    </div>
  );
};

export default ScavengerHuntComponent;
