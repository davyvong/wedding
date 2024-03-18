'use client';

import { waitForElement } from 'client/browser';
import Translate from 'client/translate';
import { ScavengerHuntTaskId } from 'components/scavenger-hunt/constants';
import useMediaQuery from 'hooks/useMediaQuery';
import Masonry from 'masonry-layout';
import Image from 'next/image';
import { FC, ReactNode, useCallback, useEffect } from 'react';

import styles from './component.module.css';

interface ScavengerHuntSubmissionsComponentProps {
  submissions: {
    checksum: string;
    id: ScavengerHuntTaskId;
    uploadedAt: Date;
    uploadedBy: string;
  }[];
}

const ScavengerHuntSubmissionsComponent: FC<ScavengerHuntSubmissionsComponentProps> = ({ submissions }) => {
  const is1Column = useMediaQuery('(max-width: 767px)');
  const is2Columns = useMediaQuery('(min-width: 768px) and (max-width: 1439px)');
  const is3Columns = useMediaQuery('(min-width: 1440px)');

  useEffect(() => {
    let masonry;
    waitForElement('.' + styles.list, (element: HTMLElement): void => {
      masonry = new Masonry(element, {
        horizontalOrder: true,
        itemSelector: '.' + styles.submission,
        percentPosition: true,
      });
    });
    return (): void => {
      masonry?.destroy();
    };
  }, [is1Column, is2Columns, is3Columns]);

  const renderSubmission = useCallback(
    (
      submission: { checksum: string; id: ScavengerHuntTaskId; uploadedAt: Date; uploadedBy: string },
      index: number,
    ): ReactNode => {
      const path = submission.uploadedBy + '/' + submission.id;
      const url = new URL('https://scavenger.vivian-and-davy.com/' + path);
      url.searchParams.set('v', submission.checksum);
      return (
        <div className={styles.submission} key={path}>
          <div className={styles.content}>
            <div className={styles.task}>
              {Translate.html('components.scavenger-hunt-submissions.uploaded-message', {
                task: Translate.t('components.scavenger-hunt.items.' + submission.id),
                username: '@' + submission.uploadedBy,
              })}
            </div>
          </div>
          <Image
            alt={Translate.t('components.scavenger-hunt.items.' + submission.id)}
            height={0}
            priority={index < 10}
            src={url.href}
            style={{ display: 'block', height: 'auto', width: '100%' }}
            unoptimized
            width={0}
          />
        </div>
      );
    },
    [],
  );

  return <div className={styles.list}>{submissions.map(renderSubmission)}</div>;
};

export default ScavengerHuntSubmissionsComponent;
