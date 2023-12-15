'use client';

import MarkEmailReadIconSVG from 'assets/icons/mark-email-read.svg';
import { isBrowser } from 'client/browser';
import Translate from 'client/translate';
import Button from 'components/button';
import Flyout from 'components/flyout';
import { FlyoutContentComponentProps, FlyoutReferenceComponentProps } from 'components/flyout/component';
import LoadingHeart from 'components/loading-heart';
import { useSearchParams } from 'next/navigation';
import { FC, useCallback, useMemo, useState } from 'react';
import { GuestTokenPayload } from 'server/authenticator';
import { MDBGuestData } from 'server/models/guest';
import { MDBResponseData } from 'server/models/response';
import useSWR from 'swr';
import { sortByKey } from 'utils/sort';

import RSVPFlyoutComponent from './component';
import styles from './index.module.css';

interface RSVPFlyoutProps {
  token: GuestTokenPayload;
}

const RSVPFlyout: FC<RSVPFlyoutProps> = ({ token }) => {
  const searchParams = useSearchParams();

  const spoofAs = useMemo<string | null>(() => {
    if (!isBrowser()) {
      return null;
    }
    if (searchParams.has('spoofAs')) {
      return searchParams.get('spoofAs');
    }
    return null;
  }, [searchParams]);

  const [selectedGuestId, setSelectedGuestId] = useState<string>(token.id);

  const swrKey = useMemo<string>(() => {
    if (spoofAs) {
      return '/api/rsvp?spoofAs=' + spoofAs;
    }
    return '/api/rsvp';
  }, [spoofAs]);

  const fetchRSVP = useCallback(async (): Promise<{
    guests: MDBGuestData[];
    responses: MDBResponseData[];
  } | null> => {
    const response = await fetch(swrKey, {
      cache: 'no-store',
      method: 'GET',
    });
    const responseJson = await response.json();
    const guests = (responseJson.guests || []).sort(sortByKey('name'));
    if (guests.some((guest: MDBGuestData): boolean => guest.id === spoofAs)) {
      setSelectedGuestId((prevState: string): string => spoofAs || prevState);
    }
    return {
      ...responseJson,
      guests,
    };
  }, [spoofAs, swrKey]);

  const { data, isLoading } = useSWR(swrKey, fetchRSVP, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const initialValues = useMemo<MDBResponseData | undefined>(() => {
    if (!data) {
      return undefined;
    }
    return data.responses.find((response: MDBResponseData): boolean => {
      return response.guest === selectedGuestId;
    });
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
          swrKey={swrKey}
        />
      );
    },
    [data, initialValues, isLoading, selectedGuestId, swrKey],
  );

  const renderReference = useCallback(
    (referenceProps: FlyoutReferenceComponentProps): JSX.Element => (
      <Button {...referenceProps}>
        <MarkEmailReadIconSVG />
        <span className={styles.buttonText}>{Translate.t('components.flyouts.rsvp.buttons.rsvp')}</span>
      </Button>
    ),
    [],
  );

  return <Flyout openWithURLParam="rsvp" renderContent={renderContent} renderReference={renderReference} />;
};

export default RSVPFlyout;
