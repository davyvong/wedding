import 'minireset.css';

import '../app/global.css';

import { Analytics } from '@vercel/analytics/react';
import { openSans } from 'client/fonts';
import NavigationBar from 'components/navigation-bar';
import type { FC, ReactNode } from 'react';
import { GuestTokenPayload } from 'server/authenticator';

interface LayoutProps {
  children: ReactNode;
  hideNavigationBar?: boolean;
  token?: GuestTokenPayload;
}

const Layout: FC<LayoutProps> = async ({ children, hideNavigationBar = false, token }) => (
  <html lang="en">
    <body className={openSans.className}>
      {!hideNavigationBar && <NavigationBar token={token} />}
      {children}
      <Analytics />
    </body>
  </html>
);

export default Layout;
