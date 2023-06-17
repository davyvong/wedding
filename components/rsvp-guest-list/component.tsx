'use client';

import { useCallback } from 'react';
import type { FC } from 'react';
import type { Guest, Invite, InviteResponse } from 'server/utils/mongodb';
import useSWR from 'swr';

export interface InvitesMeAPIResponse extends Invite {
  guests: Guest[];
  responses: InviteResponse[];
}

const RSVPGuestList: FC = () => {
  const fetchInvitesMe = useCallback(async (): Promise<InvitesMeAPIResponse> => {
    const response = await fetch('/api/invites/me', {
      cache: 'no-store',
    });
    return response.json();
  }, []);

  const { data, error } = useSWR('/api/invites/me', fetchInvitesMe);

  return <pre>{JSON.stringify({ data, error }, null, 2)}</pre>;
};

export default RSVPGuestList;
