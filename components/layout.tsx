import 'minireset.css';

import '../app/global.css';

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
    <body className={openSans.className}>
      <NavigationBar token={token} />
      {children}
      <Viewport />
    </body>
  </html>
);

export default Layout;
