'use client';

import 'minireset.css';

import './globals.css';

import Navigation from 'components/navigation';
import { NavigationProvider } from 'contexts/navigation';
import useTranslate from 'hooks/translate';
import { Inter } from 'next/font/google';
import { FC, ReactNode, useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  const t = useTranslate();

  useEffect(() => {
    document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px');
    const onResize = () => {
      document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px');
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <title>{t('app.layout.title')}</title>
      </head>
      <body className={inter.className}>
        <NavigationProvider>
          <Navigation>{children}</Navigation>
        </NavigationProvider>
      </body>
    </html>
  );
};

export default Layout;
