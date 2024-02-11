import Translate from 'client/translate';
import Layout from 'components/layout';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { FC, type ReactNode } from 'react';
import Authenticator, { GuestTokenPayload } from 'server/authenticator';

export const metadata: Metadata = {
  title: Translate.t('app.public.layout.title'),
};

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout: FC<PublicLayoutProps> = async ({ children }) => {
  const token: GuestTokenPayload | undefined = await Authenticator.verifyToken(cookies());

  return <Layout token={token}>{children}</Layout>;
};

export default PublicLayout;
