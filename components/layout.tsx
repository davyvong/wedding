import 'minireset.css';

import '../app/global.css';

import { Analytics } from '@vercel/analytics/react';
import { openSans } from 'client/fonts';
import NavigationBar from 'components/navigation-bar';
import type { ReactNode } from 'react';
import { GuestTokenPayload } from 'server/authenticator';

interface LayoutProps {
  children: ReactNode;
  hideNavigationBar?: boolean;
  token?: GuestTokenPayload;
}

const Layout = ({ children, hideNavigationBar = false, token }: LayoutProps): JSX.Element => (
  <html lang="en">
    <body className={openSans.className}>
      {!hideNavigationBar && <NavigationBar token={token} />}
      {children}
      <Analytics />
    </body>
  </html>
);

export default Layout;
