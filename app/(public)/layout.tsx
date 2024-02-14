import Layout from 'components/layout';
import { cookies } from 'next/headers';
import { FC, type ReactNode } from 'react';
import Authenticator, { VerifiedGuestTokenPayload } from 'server/authenticator';

export const runtime = 'edge';

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout: FC<PublicLayoutProps> = async ({ children }) => {
  const token: VerifiedGuestTokenPayload | undefined = await Authenticator.verifyToken(cookies());

  return <Layout token={token}>{children}</Layout>;
};

export default PublicLayout;
