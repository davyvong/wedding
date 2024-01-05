'use client';

import MarkEmailReadIconSVG from 'assets/icons/mark-email-read.svg';
import Translate from 'client/translate';
import Button from 'components/button';
import Flyout from 'components/flyout';
import { FlyoutContentComponentProps, FlyoutReferenceComponentProps } from 'components/flyout/component';
import Skeleton from 'components/skeleton';
import { FC, Fragment, useCallback, useMemo, useState } from 'react';
import { GuestTokenPayload } from 'server/authenticator';
import { GuestData } from 'server/models/guest';
import { ResponseData } from 'server/models/response';
import useSWR from 'swr';
import { sortByKey } from 'utils/sort';

import RSVPFlyoutComponent from './component';
import componentStyles from './component.module.css';
import styles from './index.module.css';

interface RSVPFlyoutProps {
  openWithURLParam?: string;
  renderReference?: (referenceProps: FlyoutReferenceComponentProps) => JSX.Element;
  token: GuestTokenPayload;
}

const RSVPFlyout: FC<RSVPFlyoutProps> = ({ openWithURLParam = 'rsvp', renderReference, token }) => {
  const [selectedGuestId, setSelectedGuestId] = useState<string>(token.id);
  const [shouldFetch, setShouldFetch] = useState<boolean>(false);

  const fetchRSVP = useCallback(async (): Promise<{
    guests: GuestData[];
    responses: ResponseData[];
  } | null> => {
    const response = await fetch('/api/rsvp/' + selectedGuestId, {
      cache: 'no-store',
      method: 'GET',
    });
    const responseJson = await response.json();
    return {
      ...responseJson,
      guests: (responseJson.guests || []).sort(sortByKey('name')),
    };
  }, [selectedGuestId]);

  const { data, isLoading, mutate } = useSWR(
    (): null | string => (shouldFetch ? '/api/rsvp/' + selectedGuestId : null),
    fetchRSVP,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const initialValues = useMemo<ResponseData | undefined>(() => {
    if (!data) {
      return undefined;
    }
    return data.responses.find((response: ResponseData): boolean => response.guest === selectedGuestId);
  }, [data, selectedGuestId]);

  const renderContent = useCallback(
    (contentProps: FlyoutContentComponentProps): JSX.Element => {
      if (isLoading) {
        const randomQuestionAndAnswerWidths = new Array(5)
          .fill(undefined)
          .map((): string[] => [
            (50 + Math.ceil(Math.random() * 50)).toString() + '%',
            (75 + Math.ceil(Math.random() * 25)).toString() + '%',
          ]);
        return (
          <div className={componentStyles.form}>
            <Skeleton height="2.5rem" inverse width={100} />
            <Skeleton height="14.5rem" inverse style={{ marginTop: '3rem' }} width="100%" />
            <Skeleton
              height="2rem"
              inverse
              style={{ marginTop: '3rem' }}
              width={(25 + Math.ceil(Math.random() * 50)).toString() + '%'}
            />
            {randomQuestionAndAnswerWidths.map(
              ([questionWidth, answerWidth]: string[], index: number): JSX.Element => (
                <Fragment key={index}>
                  <Skeleton height="1.5rem" inverse style={{ marginTop: '3rem' }} width={questionWidth} />
                  <Skeleton height="1.5rem" inverse style={{ marginTop: '1rem' }} width={answerWidth} />
                </Fragment>
              ),
            )}
            <center style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '3rem' }}>
              <Skeleton height="2.5rem" inverse style={{ borderRadius: '1.25rem' }} width={125} />
              <Skeleton height="2.5rem" inverse style={{ borderRadius: '1.25rem', marginLeft: '1.5rem' }} width={80} />
            </center>
          </div>
        );
      }
      return (
        <RSVPFlyoutComponent
          {...contentProps}
          guests={data?.guests || []}
          initialValues={initialValues}
          isEditMode={!!initialValues}
          mutateDataCache={mutate}
          selectedGuestId={selectedGuestId}
          setSelectedGuestId={setSelectedGuestId}
        />
      );
    },
    [data, initialValues, isLoading, mutate, selectedGuestId],
  );

  const renderDefaultReference = useCallback(
    (referenceProps: FlyoutReferenceComponentProps): JSX.Element => (
      <Button {...referenceProps}>
        <MarkEmailReadIconSVG />
        <span className={styles.buttonText}>{Translate.t('components.flyouts.rsvp.buttons.rsvp')}</span>
      </Button>
    ),
    [],
  );

  const onToggleFlyout = useCallback((): void => setShouldFetch(true), []);

  return (
    <Flyout
      onToggleFlyout={onToggleFlyout}
      openWithURLParam={openWithURLParam}
      renderContent={renderContent}
      renderReference={renderReference || renderDefaultReference}
    />
  );
};

export default RSVPFlyout;
