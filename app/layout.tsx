'use client';

import 'minireset.css';

import './globals.css';

import CookieBanner from 'components/cookie-banner';
import { NavigationProvider } from 'contexts/navigation';
import useTranslate from 'hooks/translate';
import { Roboto } from 'next/font/google';
import type { FC, ReactNode } from 'react';

import styles from './layout.module.css';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
});

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
        <body className={roboto.className}>
          <main className={styles.main}>{children}</main>
          <CookieBanner />
        </body>
      </html>
    </NavigationProvider>
  );
};

export default Layout;
