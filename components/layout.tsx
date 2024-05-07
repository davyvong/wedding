import 'minireset.css';

import '../app/global.css';

import { Analytics } from '@vercel/analytics/react';
import { openSans } from 'client/fonts';
import NavigationBar from 'components/navigation-bar';
import { type FC, type ReactNode } from 'react';
import { VerifiedGuestTokenPayload } from 'server/authenticator';
import Viewport from './viewport';

interface LayoutProps {
  children: ReactNode;
  token?: VerifiedGuestTokenPayload;
}

const Layout: FC<LayoutProps> = ({ children, token }) => (
  <html lang="en">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </head>
    <body className={openSans.className}>
      <NavigationBar token={token} />
      {children}
      <Analytics />
      <Viewport />
    </body>
  </html>
);

export default Layout;
