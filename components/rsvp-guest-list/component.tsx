'use client';

import Link from 'components/link';
import useTranslate from 'hooks/translate';
import { useCallback, useMemo } from 'react';
import type { FC, ReactNode } from 'react';
import MDBGuest from 'server/models/guest';
import MDBInvite from 'server/models/invite';
import MDBResponse from 'server/models/response';
import useSWR from 'swr';

import styles from './component.module.css';

export interface InvitesMeAPIResponse {
  guests: MDBGuest[];
  invite: MDBInvite;
  responses: MDBResponse[];
}

const RSVPGuestList: FC = () => {
  const { t } = useTranslate();

  const fetchInvitesMe = useCallback(async (): Promise<InvitesMeAPIResponse> => {
    const response = await fetch('/api/invites/me', {
      cache: 'no-store',
    });
    if (response.ok) {
      return response.json();
    }
    throw new Error(response.status.toString());
  }, []);

  const { data, error } = useSWR('/api/invites/me', fetchInvitesMe);

  const guests = useMemo<Map<string, MDBGuest>>(() => {
    const map = new Map<string, MDBGuest>();
    if (data) {
      for (const guest of data.guests) {
        map.set(guest.id, guest);
      }
    }
    return map;
  }, [data]);

  const responses = useMemo<Map<string, MDBResponse>>(() => {
    const map = new Map<string, MDBResponse>();
    if (data) {
      for (const response of data.responses) {
        map.set(response.guest, response);
      }
    }
    return map;
  }, [data]);

  const renderGuestResponse = useCallback(
    (guest: MDBGuest): ReactNode => {
      const response = responses.get(guest.id);
      return (
        <div className={styles.guestResponse} key={guest.id}>
          <span>{guest.name}</span>
          <Link
            className={styles.guestResponseLink}
            href={'/rsvp/' + guest.id}
            text={response ? t('components.rsvp-guest-list.edit-response') : t('components.rsvp-guest-list.rsvp')}
          />
        </div>
      );
    },
    [responses, t],
  );

  if (!data || error) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        {Array.from(guests.values()).map(renderGuestResponse)}
        <hr />
        <div className={styles.songRequests}>
          <span>{t('components.rsvp-guest-list.song-requests.description')}</span>
          <Link
            className={styles.songRequestsLink}
            href="/song-requests"
            text={t('components.rsvp-guest-list.song-requests.link')}
          />
        </div>
      </div>
    </div>
  );
};

export default RSVPGuestList;
