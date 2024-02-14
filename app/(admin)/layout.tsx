import ErrorPage from 'components/error-page';
import Layout from 'components/layout';
import { cookies } from 'next/headers';
import { FC, type ReactNode } from 'react';
import Authenticator, { VerifiedGuestTokenPayload } from 'server/authenticator';
import { generateMetadata } from 'utils/metadata';

export const runtime = 'edge';

export const metadata = generateMetadata({
  url: '/guests',
});

interface AdminGuestsLayoutProps {
  children: ReactNode;
}

const AdminGuestsLayout: FC<AdminGuestsLayoutProps> = async ({ children }) => {
  const token: VerifiedGuestTokenPayload | undefined = await Authenticator.verifyToken(cookies());

  if (!token) {
    return <ErrorPage statusCode={401} />;
  }

  if (!token.isAdmin) {
    return <ErrorPage statusCode={403} />;
  }

  return <Layout token={token}>{children}</Layout>;
};

export default AdminGuestsLayout;
