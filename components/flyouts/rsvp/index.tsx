'use client';

import MarkEmailReadIconSVG from 'assets/icons/mark-email-read.svg';
import Translate from 'client/translate';
import Button from 'components/button';
import Flyout from 'components/flyout';
import { FlyoutContentComponentProps, FlyoutReferenceComponentProps } from 'components/flyout/component';
import LoadingHeart from 'components/loading-heart';
import { FC, useCallback, useMemo, useState } from 'react';
import { GuestTokenPayload } from 'server/authenticator';
import { MDBGuestData } from 'server/models/guest';
import { MDBResponseData } from 'server/models/response';
import useSWR from 'swr';
import { sortByKey } from 'utils/sort';

import RSVPFlyoutComponent from './component';
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
    guests: MDBGuestData[];
    responses: MDBResponseData[];
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

  const { data, isLoading } = useSWR(
    (): null | string => (shouldFetch ? '/api/rsvp/' + selectedGuestId : null),
    fetchRSVP,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const initialValues = useMemo<MDBResponseData | undefined>(() => {
    if (!data) {
      return undefined;
    }
    return data.responses.find((response: MDBResponseData): boolean => response.guest === selectedGuestId);
  }, [data, selectedGuestId]);

  const renderContent = useCallback(
    (contentProps: FlyoutContentComponentProps): JSX.Element => {
      if (isLoading) {
        return (
          <div className={styles.contentLoading}>
            <LoadingHeart />
          </div>
        );
      }
      return (
        <RSVPFlyoutComponent
          {...contentProps}
          guests={data?.guests || []}
          initialValues={initialValues}
          isEditMode={!!initialValues}
          selectedGuestId={selectedGuestId}
          setSelectedGuestId={setSelectedGuestId}
        />
      );
    },
    [data, initialValues, isLoading, selectedGuestId],
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
