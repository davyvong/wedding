import Translate from 'client/translate';
import ErrorPage from 'components/error-page';
import Layout from 'components/layout';
import { cookies } from 'next/headers';
import { FC, Fragment, type ReactNode } from 'react';
import Authenticator, { GuestTokenPayload } from 'server/authenticator';

interface AdminGuestsLayoutProps {
  children: ReactNode;
}

const AdminGuestsLayout: FC<AdminGuestsLayoutProps> = async ({ children }) => {
  const token: GuestTokenPayload | undefined = await Authenticator.verifyToken(cookies());

  if (!token || !token.isAdmin) {
    return (
      <Fragment>
        <head>
          <title>{Translate.t('app.admin.layout.errorPages.404')}</title>
        </head>
        <ErrorPage statusCode={404} />
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
