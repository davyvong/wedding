'use client';

import 'minireset.css';

import './globals.css';

import CookieBanner from 'components/cookie-banner';
import Navigation from 'components/navigation';
import { NavigationProvider } from 'contexts/navigation';
import useTranslate from 'hooks/translate';
import { Inter } from 'next/font/google';
import type { FC, ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'] });

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = props => {
  const { children } = props;

  const t = useTranslate();

  return (
    <NavigationProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/favicon.ico" />
          <meta content="width=device-width, initial-scale=1" name="viewport" />
          <title>{t('app.layout.title')}</title>
        </head>
        <body className={inter.className}>
          <Navigation>{children}</Navigation>
          <CookieBanner />
        </body>
      </html>
    </NavigationProvider>
  );
};

export default Layout;
