'use client';

import Translate from 'client/translate';
import Button from 'components/button';
import Flyout from 'components/flyout';
import { FlyoutContentComponentProps, FlyoutReferenceComponentProps } from 'components/flyout/component';
import LoadingHeart from 'components/loading-heart';
import { FC, useCallback, useMemo } from 'react';
import { GuestTokenPayload } from 'server/authenticator';
import { MDBGuestData } from 'server/models/guest';
import { MDBInviteData } from 'server/models/invite';
import { MDBResponseData } from 'server/models/response';
import useSWR from 'swr';

import RSVPFlyoutComponent from './component';
import styles from './index.module.css';

interface RSVPFlyoutProps {
  token?: GuestTokenPayload;
}

const RSVPFlyout: FC<RSVPFlyoutProps> = ({ token }) => {
  const fetchRSVP = useCallback(async (): Promise<{
    guests: MDBGuestData[];
    invite: MDBInviteData;
    responses: MDBResponseData[];
  } | null> => {
    const response = await fetch('/api/rsvp', {
      cache: 'no-store',
      method: 'GET',
    });
    const responseJson = await response.json();
    return responseJson;
  }, []);

  const { data: rsvpData, isLoading: rsvpIsLoading } = useSWR('/api/rsvp', fetchRSVP, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const initialValues = useMemo<MDBResponseData | undefined>(() => {
    if (!rsvpData || !token) {
      return undefined;
    }
    return rsvpData.responses.find((response: MDBResponseData): boolean => response.guest === token.id);
  }, [rsvpData, token]);

  const renderContent = useCallback(
    (contentProps: FlyoutContentComponentProps): JSX.Element => {
      if (rsvpIsLoading) {
        return (
          <div className={styles.contentLoading}>
            <LoadingHeart />
          </div>
        );
      }
      return <RSVPFlyoutComponent {...contentProps} initialValues={initialValues} isEditMode={!!initialValues} />;
    },
    [initialValues, rsvpIsLoading],
  );

  const renderReference = useCallback(
    (referenceProps: FlyoutReferenceComponentProps): JSX.Element => (
      <Button {...referenceProps}>{Translate.t('components.flyouts.rsvp.buttons.check-rsvp')}</Button>
    ),
    [],
  );

  return <Flyout openWithURLParam="rsvp" renderContent={renderContent} renderReference={renderReference} />;
};

export default RSVPFlyout;
