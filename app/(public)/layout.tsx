import Translate from 'client/translate';
import Layout from 'components/layout';
import { cookies } from 'next/headers';
import { Fragment, type ReactNode } from 'react';
import Authenticator, { GuestTokenPayload } from 'server/authenticator';

export const dynamic = 'force-dynamic';

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout = async ({ children }: PublicLayoutProps): Promise<JSX.Element> => {
  const token: GuestTokenPayload | undefined = await Authenticator.verifyToken(cookies());

  return (
    <Fragment>
      <head>
        <title>{Translate.t('app.public.layout.title')}</title>
      </head>
      <Layout token={token}>{children}</Layout>
    </Fragment>
  );
};

export default PublicLayout;
