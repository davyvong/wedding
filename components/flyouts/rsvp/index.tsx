'use client';

import Translate from 'client/translate';
import Button from 'components/button';
import Flyout from 'components/flyout';
import { FlyoutContentComponentProps, FlyoutReferenceComponentProps } from 'components/flyout/component';
import { FC, useCallback, useMemo } from 'react';
import { GuestTokenPayload } from 'server/authenticator';
import { MDBGuestData } from 'server/models/guest';
import { MDBInviteData } from 'server/models/invite';
import { MDBResponseData } from 'server/models/response';
import useSWR from 'swr';

import RSVPFlyoutComponent from './component';

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

  const { data: rsvpData } = useSWR('/api/rsvp', fetchRSVP, {
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
    (contentProps: FlyoutContentComponentProps): JSX.Element => (
      <RSVPFlyoutComponent {...contentProps} initialValues={initialValues} isEditMode={!!token} />
    ),
    [initialValues, token],
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
