'use client';

import Link from 'components/link';
import useTranslate from 'hooks/translate';
import { useCallback, useMemo } from 'react';
import type { FC, ReactNode } from 'react';
import type { Guest, Invite, InviteResponse } from 'server/utils/mongodb';
import useSWR from 'swr';

import styles from './component.module.css';

export interface InvitesMeAPIResponse extends Invite {
  guests: Guest[];
  responses: InviteResponse[];
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

  const guests = useMemo<Map<string, Guest>>(() => {
    const map = new Map<string, Guest>();
    if (data) {
      for (const guest of data.guests) {
        map.set(guest.id, guest);
      }
    }
    return map;
  }, [data]);

  const responses = useMemo<Map<string, InviteResponse>>(() => {
    const map = new Map<string, InviteResponse>();
    if (data) {
      for (const response of data.responses) {
        map.set(response.guest, response);
      }
    }
    return map;
  }, [data]);

  const renderGuestResponse = useCallback(
    (response: InviteResponse): ReactNode => {
      const guest = guests.get(response.guest);
      if (!guest) {
        return null;
      }
      return (
        <div className={styles.guestResponse} key={response.id}>
          <span>{guest.name}</span>
          <Link className={styles.guestResponseLink} href="/" text={t('components.rsvp-guest-list.rsvp')} />
        </div>
      );
    },
    [guests, t],
  );

  if (!data || error) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>{Array.from(responses.values()).map(renderGuestResponse)}</div>
    </div>
  );
};

export default RSVPGuestList;
