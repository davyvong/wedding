'use client';

import Background1IWEBP from 'assets/images/scavenger-hunt/background-1.webp';
import Background2PNG from 'assets/images/scavenger-hunt/background-2.png';
import Background3PNG from 'assets/images/scavenger-hunt/background-3.png';
import CameraWEBP from 'assets/images/scavenger-hunt/camera.webp';
import classNames from 'classnames';
import { getStyleProperty, waitForElement } from 'client/browser';
import { apricots, vidaloka } from 'client/fonts';
import Translate from 'client/translate';
import ScavengerHuntTask from 'components/scavenger-hunt-task';
import ScavengerHuntUsername from 'components/scavenger-hunt-username';
import Image from 'next/image';
import { FC, Fragment, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { ScavengerHuntTokenPayload } from 'server/tokens/scavenger-hunt';

import { fetchSubmittedTasks } from './actions';
import styles from './component.module.css';
import { ScavengerHuntTaskId, scavengerHuntTasks } from './constants';

interface ScavengerHuntComponentProps {
  token?: ScavengerHuntTokenPayload;
}

const ScavengerHuntComponent: FC<ScavengerHuntComponentProps> = ({ token }) => {
  const [hasUsername, setHasUsername] = useState<boolean>(!!token);
  const [submittedTasks, setSubmittedTasks] = useState<Set<ScavengerHuntTaskId>>(new Set());

  const renderLayout = useCallback(
    (children: ReactNode, hasFooter: boolean = true): JSX.Element => (
      <div className={styles.page}>
        <div className={classNames(styles.card, hasFooter && styles.cardWithFooter)}>
          <Image alt="" className={styles.background1} priority src={Background1IWEBP} />
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

  const fetchTasks = useCallback(async (): Promise<void> => {
    try {
      const results = await fetchSubmittedTasks();
      if (results) {
        setSubmittedTasks(new Set(results.tasks));
      }
    } catch {
      // Failed to fetch submitted tasks
    }
  }, []);

  const onSuccessfulUpload = useCallback(
    async (id: ScavengerHuntTaskId): Promise<void> => {
      setSubmittedTasks((prevState: Set<ScavengerHuntTaskId>): Set<ScavengerHuntTaskId> => {
        const nextState = new Set(prevState);
        nextState.add(id);
        return nextState;
      });
      await fetchTasks();
      waitForElement('#' + id, (element: HTMLElement): void => {
        let top = window.pageYOffset + element.getBoundingClientRect().top;
        const navigationBarHeight = getStyleProperty('--navigation-bar-height');
        if (navigationBarHeight) {
          top -= parseInt(navigationBarHeight.replace('px', ''));
        }
        document.querySelector<HTMLElement>('body')?.scrollTo({
          behavior: 'smooth',
          top,
        });
      });
    },
    [fetchTasks],
  );

  const renderTask = useCallback(
    (task: { id: ScavengerHuntTaskId; name: string }): JSX.Element => (
      <ScavengerHuntTask
        {...task}
        isCompleted={submittedTasks.has(task.id)}
        key={task.id}
        onSuccessfulUpload={onSuccessfulUpload}
        username={token!.username}
      />
    ),
    [onSuccessfulUpload, submittedTasks, token],
  );

  const groupedTasks = useMemo<{
    available: { id: ScavengerHuntTaskId; name: string }[];
    submitted: { id: ScavengerHuntTaskId; name: string }[];
  }>(() => {
    const groups: {
      available: { id: ScavengerHuntTaskId; name: string }[];
      submitted: { id: ScavengerHuntTaskId; name: string }[];
    } = {
      available: [],
      submitted: [],
    };
    for (const task of scavengerHuntTasks) {
      if (submittedTasks.has(task.id)) {
        groups.submitted.push(task);
      } else {
        groups.available.push(task);
      }
    }
    return groups;
  }, [submittedTasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  if (!hasUsername) {
    return renderLayout(<ScavengerHuntUsername setHasUsername={setHasUsername} />, false);
  }

  return renderLayout(
    <Fragment>
      <Image alt="" className={styles.background2} priority src={Background2PNG} />
      <Image alt="" className={styles.background3} priority src={Background3PNG} />
      {groupedTasks.available.map(renderTask)}
      {groupedTasks.submitted.length > 0 && (
        <Fragment>
          <div className={classNames(styles.instructions, vidaloka.className)}>
            {Translate.t('components.scavenger-hunt-submitted-photos')}
          </div>
          {groupedTasks.submitted.map(renderTask)}
        </Fragment>
      )}
      <div className={classNames(styles.instructions, vidaloka.className)}>
        {Translate.t('components.scavenger-hunt.instructions')}
      </div>
    </Fragment>,
  );
};

export default ScavengerHuntComponent;
