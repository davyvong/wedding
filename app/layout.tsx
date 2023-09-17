import 'minireset.css';

import './global.css';

import { Analytics } from '@vercel/analytics/react';
import { openSans } from 'client/fonts';
import Translate from 'client/translate';
import NavigationBar from 'components/navigation-bar';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import Authenticator, { GuestTokenPayload } from 'server/authenticator';

interface LayoutProps {
  children: ReactNode;
}

const Layout = async ({ children }: LayoutProps): Promise<JSX.Element> => {
  const token: GuestTokenPayload | undefined = await Authenticator.verifyToken(cookies());

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>{Translate.t('app.layout.title')}</title>
      </head>
      <body className={openSans.className}>
        <NavigationBar token={token} />
        {children}
        <Analytics />
      </body>
    </html>
  );
};

export default Layout;
