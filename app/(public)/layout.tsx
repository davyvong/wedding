import Translate from 'client/translate';
import Layout from 'components/layout';
import { cookies } from 'next/headers';
import { FC, Fragment, type ReactNode } from 'react';
import Authenticator, { GuestTokenPayload } from 'server/authenticator';

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout: FC<PublicLayoutProps> = async ({ children }) => {
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
