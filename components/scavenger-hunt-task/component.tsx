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
  onSuccessfulUpload: (id: ScavengerHuntTaskId) => void;
}

const ScavengerHuntTaskComponent: FC<ScavengerHuntTaskComponentProps> = ({
  id,
  isCompleted,
  name,
  onSuccessfulUpload,
}) => {
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const uploadFile = useCallback(
    async (file?: File | null): Promise<void> => {
      try {
        if (!file) {
          return;
        }
        setErrorMessage(undefined);
        setIsUploading(true);
        const { data: uploadURL, error } = await fetchUploadURL(id, file.type, file.size);
        if (error) {
          throw error;
        }
        if (uploadURL) {
          await fetch(uploadURL, {
            body: file,
            method: 'PUT',
          });
          onSuccessfulUpload(id);
        }
      } catch (error: unknown) {
        if (typeof error === 'string') {
          setErrorMessage(error);
        }
      } finally {
        setIsUploading(false);
      }
    },
    [id, onSuccessfulUpload],
  );

  const onChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
      await uploadFile(event.target?.files?.item(0));
    },
    [uploadFile],
  );

  const onRetry = useCallback(async (): Promise<void> => {
    const fileInput = document.getElementById(id) as HTMLInputElement | null;
    await uploadFile(fileInput?.files?.item(0));
  }, [id, uploadFile]);

  const onUpload = useCallback(async (): Promise<void> => {
    const fileInput = document.getElementById(id) as HTMLInputElement | null;
    fileInput?.click();
  }, [id]);

  const onClick = useCallback(() => {
    if (isCompleted) {
      return;
    }
    if (isUploading) {
      return;
    }
    if (errorMessage === 'components.scavenger-hunt-task.errors.failed') {
      onRetry();
      return;
    }
    onUpload();
  }, [errorMessage, isCompleted, isUploading, onRetry, onUpload]);

  const renderHint = useCallback((): JSX.Element => {
    if (isCompleted) {
      return <div className={styles.hint}>{Translate.t('components.scavenger-hunt-task.hints.submitted')}</div>;
    }
    if (isUploading) {
      return <div className={styles.hint}>{Translate.t('components.scavenger-hunt-task.hints.uploading')}</div>;
    }
    if (errorMessage) {
      return <div className={classNames(styles.hint, styles.errorMessage)}>{Translate.t(errorMessage)}</div>;
    }
    return <div className={styles.hint}>{Translate.t('components.scavenger-hunt-task.hints.upload')}</div>;
  }, [errorMessage, isCompleted, isUploading]);

  return (
    <div className={classNames(styles.task, isCompleted && styles.completed)}>
      <Image alt={name} className={styles.heart} src={isCompleted ? HeartFilledWEBP : HeartEmptyWEBP} width={32} />
      <div className={styles.content} onClick={onClick}>
        <div>{name}</div>
        {renderHint()}
      </div>
      <input accept="image/*" disabled={isUploading} hidden id={id} multiple={false} onChange={onChange} type="file" />
    </div>
  );
};

export default ScavengerHuntTaskComponent;
