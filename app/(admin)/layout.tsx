import Translate from 'client/translate';
import ErrorPage from 'components/error-page';
import Layout from 'components/layout';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { FC, type ReactNode } from 'react';
import Authenticator, { GuestTokenPayload } from 'server/authenticator';

export const metadata: Metadata = {
  title: Translate.t('app.public.layout.title'),
};

interface AdminGuestsLayoutProps {
  children: ReactNode;
}

const AdminGuestsLayout: FC<AdminGuestsLayoutProps> = async ({ children }) => {
  const token: GuestTokenPayload | undefined = await Authenticator.verifyToken(cookies());

  if (!token) {
    return <ErrorPage statusCode={401} />;
  }

  if (!token.isAdmin) {
    return <ErrorPage statusCode={403} />;
  }

  return <Layout token={token}>{children}</Layout>;
};

export default AdminGuestsLayout;
