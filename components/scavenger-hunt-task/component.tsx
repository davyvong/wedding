'use client';

import AddFilesSVG from 'assets/images/scavenger-hunt/add-files.svg';
import HeartFilledWEBP from 'assets/images/scavenger-hunt/heart-filled.webp';
import HeartEmptyWEBP from 'assets/images/scavenger-hunt/heart.webp';
import Translate from 'client/translate';
import Button from 'components/button';
import ErrorBoundary from 'components/error-boundary';
import LoadingHeart from 'components/loading-heart';
import { ScavengerHuntTaskId } from 'components/scavenger-hunt/constants';
import Sheet from 'components/sheet';
import Image from 'next/image';
import { ChangeEvent, FC, Fragment, useCallback, useState } from 'react';

import { deleteSubmission, fetchUploadURL } from './actions';
import styles from './component.module.css';

interface ScavengerHuntTaskComponentProps {
  id: ScavengerHuntTaskId;
  isCompleted: boolean;
  name: string;
  onSuccessfulDelete: (id: ScavengerHuntTaskId) => void;
  onSuccessfulUpload: (id: ScavengerHuntTaskId) => void;
  username: string;
}

const ScavengerHuntTaskComponent: FC<ScavengerHuntTaskComponentProps> = ({
  id,
  isCompleted,
  name,
  onSuccessfulDelete,
  onSuccessfulUpload,
  username,
}) => {
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
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
    (event: ChangeEvent<HTMLInputElement>): void => {
      uploadFile(event.target?.files?.item(0));
    },
    [uploadFile],
  );

  const onDelete = useCallback(async (): Promise<void> => {
    try {
      setIsDeleting(true);
      await deleteSubmission(id);
      onSuccessfulDelete(id);
    } finally {
      setIsDeleting(false);
    }
  }, [id, onSuccessfulDelete]);

  const onRetry = useCallback((): void => {
    const fileInput = document.getElementById(id + '-file') as HTMLInputElement | null;
    uploadFile(fileInput?.files?.item(0));
  }, [id, uploadFile]);

  const onUpload = useCallback((): void => {
    const fileInput = document.getElementById(id + '-file') as HTMLInputElement | null;
    fileInput?.click();
  }, [id]);

  const renderSubmittedImage = useCallback((): JSX.Element => {
    if (!isCompleted) {
      return (
        <Fragment>
          <div className={styles.imageUploader} onClick={onUpload}>
            <div className={styles.imageUploaderContent}>
              <AddFilesSVG className={styles.imageUploaderIcon} />
              {isUploading ? (
                <span>{Translate.t('components.scavenger-hunt-task.upload-placeholder.uploading')}</span>
              ) : (
                <span>{Translate.t('components.scavenger-hunt-task.upload-placeholder.upload')}</span>
              )}
            </div>
          </div>
          {errorMessage && <div className={styles.errorMessage}>{Translate.t(errorMessage)}</div>}
          <input
            accept="image/*"
            disabled={isUploading}
            hidden
            id={id + '-file'}
            multiple={false}
            onChange={onChange}
            type="file"
          />
        </Fragment>
      );
    }
    const url = new URL('https://scavenger.vivian-and-davy.com/' + username + '/' + id);
    return (
      <ErrorBoundary>
        <a href={url.href} target="_blank">
          <Image
            alt={Translate.t('components.scavenger-hunt.items.' + id)}
            className={styles.submittedImage}
            height={0}
            src={url.href}
            style={{ height: 'auto', width: '100%' }}
            unoptimized
            width={0}
          />
        </a>
      </ErrorBoundary>
    );
  }, [errorMessage, id, isCompleted, isUploading, onChange, onUpload, username]);

  const renderContent = useCallback(
    ({ setIsOpen }) => (
      <Fragment>
        <div className={styles.taskName}>{name}</div>
        {renderSubmittedImage()}
        <div className={styles.sheetActions}>
          {errorMessage === 'components.scavenger-hunt-task.errors.failed' && (
            <Button className={styles.deleteButton} disabled={isUploading} onClick={onRetry}>
              {isUploading ? (
                <Fragment>
                  <LoadingHeart className={styles.deleteButtonLoading} />
                  <span>{Translate.t('components.scavenger-hunt-task.buttons.retrying-upload')}</span>
                </Fragment>
              ) : (
                <span>{Translate.t('components.scavenger-hunt-task.buttons.retry-upload')}</span>
              )}
            </Button>
          )}
          {isCompleted && (
            <Button className={styles.deleteButton} disabled={isDeleting} onClick={onDelete}>
              {isDeleting ? (
                <Fragment>
                  <LoadingHeart className={styles.deleteButtonLoading} />
                  <span>{Translate.t('components.scavenger-hunt-task.buttons.deleting')}</span>
                </Fragment>
              ) : (
                <span>{Translate.t('components.scavenger-hunt-task.buttons.delete')}</span>
              )}
            </Button>
          )}
          <div className={styles.spacer} />
          <Button inverse onClick={() => setIsOpen(false)}>
            {Translate.t('components.scavenger-hunt-task.buttons.close')}
          </Button>
        </div>
      </Fragment>
    ),
    [errorMessage, isCompleted, isDeleting, isUploading, name, onDelete, onRetry, renderSubmittedImage],
  );

  const renderReference = useCallback(
    refProps => (
      <div {...refProps} className={styles.task} id={id}>
        <Image alt={name} className={styles.heart} src={isCompleted ? HeartFilledWEBP : HeartEmptyWEBP} width={32} />
        <span>{name}</span>
      </div>
    ),
    [id, isCompleted, name],
  );

  return <Sheet renderContent={renderContent} renderReference={renderReference} />;
};

export default ScavengerHuntTaskComponent;
