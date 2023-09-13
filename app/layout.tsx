import 'minireset.css';

import './global.css';

import { Analytics } from '@vercel/analytics/react';
import { openSans } from 'client/fonts';
import Translate from 'client/translate';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = async ({ children }: LayoutProps): Promise<JSX.Element> => (
  <html lang="en">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <title>{Translate.t('app.layout.title')}</title>
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script src="./scroll-smoother.js" />
    </head>
    <body className={openSans.className}>
      {children}
      <Analytics />
    </body>
  </html>
);

export default Layout;
