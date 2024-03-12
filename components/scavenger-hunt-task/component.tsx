'use client';

import HeartFilledWEBP from 'assets/images/scavenger-hunt/heart-filled.webp';
import HeartEmptyWEBP from 'assets/images/scavenger-hunt/heart.webp';
import classNames from 'classnames';
import Translate from 'client/translate';
import { ScavengerHuntTask } from 'components/scavenger-hunt/constants';
import Image from 'next/image';
import { ChangeEvent, FC, useCallback, useMemo, useState } from 'react';

import styles from './component.module.css';

interface ScavengerHuntTaskComponentProps extends ScavengerHuntTask {
  disabled?: boolean;
}

const ScavengerHuntTaskComponent: FC<ScavengerHuntTaskComponentProps> = ({ id, disabled = false, name }) => {
  const [canRetry, setCanRetry] = useState<boolean>(false);

  const fetchSignedURL = useCallback(async (): Promise<URL> => {
    const response = await fetch('/api/scavenger/task', {
      body: JSON.stringify({
        task: id,
      }),
      cache: 'no-cache',
      method: 'POST',
    });
    const responseJson = await response.json();
    return new URL(responseJson.uploadURL);
  }, [id]);

  const uploadFile = useCallback(
    async (file?: File | null): Promise<void> => {
      if (!file) {
        return;
      }
      try {
        setCanRetry(false);
        const url = await fetchSignedURL();
        await fetch(url, {
          body: file,
          method: 'PUT',
        });
      } catch {
        setCanRetry(true);
      }
    },
    [fetchSignedURL],
  );

  const onChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
      try {
        setCanRetry(false);
        await uploadFile(event.target?.files?.item(0));
      } catch {
        setCanRetry(true);
      }
    },
    [uploadFile],
  );

  const onRetry = useCallback(async (): Promise<void> => {
    try {
      setCanRetry(false);
      const fileInput = document.getElementById(id) as HTMLInputElement | null;
      await uploadFile(fileInput?.files?.item(0));
    } catch {
      setCanRetry(true);
    }
  }, [id, uploadFile]);

  const onUpload = useCallback(async (): Promise<void> => {
    const fileInput = document.getElementById(id) as HTMLInputElement | null;
    fileInput?.click();
  }, [id]);

  const onClick = useCallback(() => {
    if (disabled) {
      return;
    }
    if (canRetry) {
      onRetry();
    }
    onUpload();
  }, [canRetry, disabled, onRetry, onUpload]);

  const renderStatus = useCallback((): string => {
    if (disabled) {
      return Translate.t('components.scavenger-hunt.statuses.completed');
    }
    if (canRetry) {
      return Translate.t('components.scavenger-hunt.statuses.retry');
    }
    return Translate.t('components.scavenger-hunt.statuses.upload');
  }, [canRetry, disabled]);

  const isCompleted = useMemo<boolean>(() => false, []);

  return (
    <div className={classNames(styles.task, isCompleted && styles.completed)}>
      <Image alt={name} className={styles.heart} src={isCompleted ? HeartFilledWEBP : HeartEmptyWEBP} width={32} />
      <div className={styles.content} onClick={onClick}>
        <span>{name}</span> <span className={styles.status}>{renderStatus()}</span>
      </div>
      <input hidden id={id} multiple={false} onChange={onChange} type="file" />
    </div>
  );
};

export default ScavengerHuntTaskComponent;
