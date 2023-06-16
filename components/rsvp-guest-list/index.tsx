'use client';

import { useCallback } from 'react';
import type { FC } from 'react';
import useSWR from 'swr';

import RSVPGuestListComponent from './component';

const RSVPGuestList: FC = () => {
  const fetchInvites = useCallback((): Promise<Response> => fetch('/api/invites/me'), []);

  const { data, error } = useSWR('/api/invites/me', fetchInvites);

  return <RSVPGuestListComponent data={data} error={error} />;
};

export default RSVPGuestList;
