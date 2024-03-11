'use client';

import Translate from 'client/translate';
import { ScavengerHuntTask } from 'components/scavenger-hunt/constants';
import { ChangeEvent, FC, Fragment, useCallback, useState } from 'react';

import styles from './component.module.css';

interface ScavengerHuntUploaderComponentProps {
  disabled?: boolean;
  task: ScavengerHuntTask;
}

const ScavengerHuntUploaderComponent: FC<ScavengerHuntUploaderComponentProps> = ({ disabled = false, task }) => {
  const [canRetry, setCanRetry] = useState<boolean>(false);

  const fetchSignedURL = useCallback(async (): Promise<URL> => {
    const response = await fetch('/api/scavenger/task', {
      body: JSON.stringify({
        task: task.id,
      }),
      cache: 'no-cache',
      method: 'POST',
    });
    const responseJson = await response.json();
    return new URL(responseJson.uploadURL);
  }, [task]);

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
      const fileInput = document.getElementById(task.id) as HTMLInputElement | null;
      await uploadFile(fileInput?.files?.item(0));
    } catch {
      setCanRetry(true);
    }
  }, [task, uploadFile]);

  const onUpload = useCallback(async (): Promise<void> => {
    const fileInput = document.getElementById(task.id) as HTMLInputElement | null;
    fileInput?.click();
  }, [task]);

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

  return (
    <Fragment>
      <div className={styles.taskContent} onClick={onClick}>
        <span>{task.name}</span> <span className={styles.taskStatus}>{renderStatus()}</span>
      </div>
      <input hidden id={task.id} multiple={false} onChange={onChange} type="file" />
    </Fragment>
  );
};

export default ScavengerHuntUploaderComponent;
