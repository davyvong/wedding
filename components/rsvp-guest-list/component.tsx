'use client';

import useTranslate from 'hooks/translate';
import Link from 'next/link';
import { useCallback, useMemo } from 'react';
import type { FC, ReactNode } from 'react';
import { GuestTokenPayload } from 'server/authenticator';
import { MDBGuestData } from 'server/models/guest';
import { MDBInviteData } from 'server/models/invite';
import { MDBResponseData } from 'server/models/response';

import { clearTokenCookie } from './actions';
import styles from './component.module.css';

interface RSVPGuestListProps {
  guests: MDBGuestData[];
  invite: MDBInviteData;
  responses: MDBResponseData[];
  token: GuestTokenPayload;
}

const RSVPGuestList: FC<RSVPGuestListProps> = ({ guests = [], responses = [], token }) => {
  const { t } = useTranslate();

  const responseMap = useMemo<Map<string, MDBResponseData>>(() => {
    const map = new Map<string, MDBResponseData>();
    for (const response of responses) {
      map.set(response.guest, response);
    }
    return map;
  }, [responses]);

  const renderGuestResponse = useCallback(
    (guest: MDBGuestData): ReactNode => {
      const response = responseMap.get(guest.id);
      const isUser = guest.id === token.id;
      return (
        <div className={styles.guestInvitation} key={guest.id}>
          <div className={styles.guestInfo}>
            <div className={styles.guestName}>
              {guest.name}{' '}
              {isUser && (
                <Link className={styles.guestNotYou} href="/secret-link" onClick={() => clearTokenCookie()}>
                  {t('components.rsvp-guest-list.guest-not-you')}
                </Link>
              )}
            </div>
            <div className={styles.guestEmail}>{guest.email}</div>
          </div>
          <Link href={'/rsvp/' + guest.id}>
            {response ? t('components.rsvp-guest-list.edit-response') : t('components.rsvp-guest-list.rsvp')}
          </Link>
        </div>
      );
    },
    [responseMap, t, token],
  );

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        {Array.from(guests.values()).map(renderGuestResponse)}
        <hr />
        <div className={styles.songRequests}>
          <span>{t('components.rsvp-guest-list.song-requests.description')}</span>
          <Link className={styles.songRequestsLink} href="/song-requests">
            {t('components.rsvp-guest-list.song-requests.link')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RSVPGuestList;
