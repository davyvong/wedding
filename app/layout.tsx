'use client';

import 'minireset.css';

import './colors.css';
import './global.css';

import { Analytics } from '@vercel/analytics/react';
import Navigation from 'components/navigation';
import { NavigationProvider } from 'contexts/navigation';
import useTranslate from 'hooks/translate';
import { Inter } from 'next/font/google';
import { useEffect } from 'react';
import type { FC, ReactNode } from 'react';
import { setVH } from 'utils/browser';

const inter = Inter({
  display: 'swap',
  subsets: ['latin'],
});

setVH();

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  const { t } = useTranslate();

  useEffect(() => {
    setVH();
    window.addEventListener('resize', setVH);
    return () => {
      window.removeEventListener('resize', setVH);
    };
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <title>{t('app.layout.title')}</title>
      </head>
      <body className={inter.className}>
        <NavigationProvider>
          <Navigation>{children}</Navigation>
        </NavigationProvider>
        <Analytics />
      </body>
    </html>
  );
};

export default Layout;
