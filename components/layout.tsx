'use client';

import 'minireset.css';

import '../app/global.css';

import { Analytics } from '@vercel/analytics/react';
import { openSans } from 'client/fonts';
import NavigationBar from 'components/navigation-bar';
import { useEffect, type FC, type ReactNode } from 'react';
import { VerifiedGuestTokenPayload } from 'server/authenticator';

interface LayoutProps {
  children: ReactNode;
  token?: VerifiedGuestTokenPayload;
}

const Layout: FC<LayoutProps> = ({ children, token }) => {
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.userAgent.indexOf('iPhone') > 1) {
      document
        .querySelector('[name=viewport]')
        ?.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1');
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
