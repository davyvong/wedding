'use client';

import HeartFilledWEBP from 'assets/images/scavenger-hunt/heart-filled.webp';
import HeartEmptyWEBP from 'assets/images/scavenger-hunt/heart.webp';
import classNames from 'classnames';
import Translate from 'client/translate';
import { ScavengerHuntTaskId } from 'components/scavenger-hunt/constants';
import Image from 'next/image';
import { ChangeEvent, FC, useCallback, useState } from 'react';

import { fetchUploadURL } from './actions';
import styles from './component.module.css';

interface ScavengerHuntTaskComponentProps {
  id: ScavengerHuntTaskId;
  isCompleted: boolean;
  name: string;
}

const ScavengerHuntTaskComponent: FC<ScavengerHuntTaskComponentProps> = ({ id, isCompleted, name }) => {
  const [canRetry, setCanRetry] = useState<boolean>(false);

  const uploadFile = useCallback(
    async (file?: File | null): Promise<void> => {
      if (!file) {
        return;
      }
      try {
        setCanRetry(false);
        const url = await fetchUploadURL(id);
        if (url) {
          await fetch(url, {
            body: file,
            cache: 'no-store',
            method: 'PUT',
          });
        } else {
          setCanRetry(true);
        }
      } catch {
        setCanRetry(true);
      }
    },
    [id],
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
    if (isCompleted) {
      return;
    }
    if (canRetry) {
      onRetry();
    }
    onUpload();
  }, [canRetry, isCompleted, onRetry, onUpload]);

  const renderStatus = useCallback((): string => {
    if (isCompleted) {
      return Translate.t('components.scavenger-hunt.statuses.completed');
    }
    if (canRetry) {
      return Translate.t('components.scavenger-hunt.statuses.retry');
    }
    return Translate.t('components.scavenger-hunt.statuses.upload');
  }, [canRetry, isCompleted]);

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
