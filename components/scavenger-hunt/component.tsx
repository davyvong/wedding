'use client';

import Background1IWEBP from 'assets/images/scavenger-hunt/background-1.webp';
import Background2PNG from 'assets/images/scavenger-hunt/background-2.png';
import Background3PNG from 'assets/images/scavenger-hunt/background-3.png';
import CameraWEBP from 'assets/images/scavenger-hunt/camera.webp';
import classNames from 'classnames';
import { apricots, vidaloka } from 'client/fonts';
import Translate from 'client/translate';
import ScavengerHuntTask from 'components/scavenger-hunt-task';
import ScavengerHuntUsername from 'components/scavenger-hunt-username';
import Image from 'next/image';
import { FC, Fragment, ReactNode, useCallback, useState } from 'react';
import { ScavengerHuntTokenPayload } from 'server/tokens/scavenger-hunt';

import styles from './component.module.css';
import { ScavengerHuntTaskId, scavengerHuntTasks } from './constants';

interface ScavengerHuntComponentProps {
  submissions: ScavengerHuntTaskId[];
  token?: ScavengerHuntTokenPayload;
}

const ScavengerHuntComponent: FC<ScavengerHuntComponentProps> = ({ submissions, token }) => {
  const [submittedTasks, setSubmittedTasks] = useState<Set<ScavengerHuntTaskId>>(new Set(submissions));
  const [username, setUsername] = useState<string>(token?.username || '');

  const renderLayout = useCallback(
    (children: ReactNode, hasFooter: boolean = true): JSX.Element => (
      <div className={styles.page}>
        <div className={classNames(styles.card, hasFooter && styles.cardWithFooter)}>
          <Image
            alt=""
            className={classNames(styles.background1, !hasFooter && styles.background1WithoutFooter)}
            priority
            src={Background1IWEBP}
          />
          <div className={classNames(styles.pretitle, apricots.className)}>
            <Image alt="" className={styles.camera} height={40} priority src={CameraWEBP} />
            <span>{Translate.t('components.scavenger-hunt.pretitle')}</span>
            <Image alt="" className={styles.camera} height={40} priority src={CameraWEBP} />
          </div>
          <div className={classNames(styles.title, vidaloka.className)}>
            {Translate.t('components.scavenger-hunt.title')}
          </div>
          {children}
        </div>
      </div>
    ),
    [],
  );

  const onSuccessfulUpload = useCallback(async (id: ScavengerHuntTaskId): Promise<void> => {
    setSubmittedTasks((prevState: Set<ScavengerHuntTaskId>): Set<ScavengerHuntTaskId> => {
      const nextState = new Set(prevState);
      nextState.add(id);
      return nextState;
    });
  }, []);

  const onSuccessfulDelete = useCallback(async (id: ScavengerHuntTaskId): Promise<void> => {
    setSubmittedTasks((prevState: Set<ScavengerHuntTaskId>): Set<ScavengerHuntTaskId> => {
      const nextState = new Set(prevState);
      nextState.delete(id);
      return nextState;
    });
  }, []);

  const renderTask = useCallback(
    (task: { id: ScavengerHuntTaskId; name: string }): JSX.Element => (
      <ScavengerHuntTask
        {...task}
        isCompleted={submittedTasks.has(task.id)}
        key={task.id}
        onSuccessfulDelete={onSuccessfulDelete}
        onSuccessfulUpload={onSuccessfulUpload}
        username={username}
      />
    ),
    [onSuccessfulDelete, onSuccessfulUpload, submittedTasks, username],
  );

  if (!username) {
    return renderLayout(<ScavengerHuntUsername onClaimUsername={setUsername} />, false);
  }

  return renderLayout(
    <Fragment>
      <Image alt="" className={styles.background2} priority src={Background2PNG} />
      <Image alt="" className={styles.background3} priority src={Background3PNG} />
      <div className={classNames(styles.instructions, vidaloka.className)}>
        {Translate.t('components.scavenger-hunt.instructions')}
      </div>
      {scavengerHuntTasks.map(renderTask)}
    </Fragment>,
  );
};

export default ScavengerHuntComponent;
