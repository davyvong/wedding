import Translate from 'client/translate';
import ErrorPage from 'components/error-page';
import Layout from 'components/layout';
import { cookies } from 'next/headers';
import { Fragment, type ReactNode } from 'react';
import Authenticator, { GuestTokenPayload } from 'server/authenticator';

export const dynamic = 'force-dynamic';

interface AdminGuestsLayoutProps {
  children: ReactNode;
}

const AdminGuestsLayout = async ({ children }: AdminGuestsLayoutProps): Promise<JSX.Element> => {
  const token: GuestTokenPayload | undefined = await Authenticator.verifyToken(cookies());

  if (!token || !token.isAdmin) {
    return (
      <Fragment>
        <head>
          <title>{Translate.t('app.admin.layout.404-title')}</title>
        </head>
        <Layout hideNavigationBar>
          <ErrorPage statusCode={404} />
        </Layout>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <head>
        <title>{Translate.t('app.admin.layout.title')}</title>
      </head>
      <Layout token={token}>{children}</Layout>
    </Fragment>
  );
};

export default AdminGuestsLayout;
