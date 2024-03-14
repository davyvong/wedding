import { Italiana, Open_Sans, Vidaloka } from 'next/font/google';
import localFont from 'next/font/local';

export const apricots = localFont({
  display: 'swap',
  src: '../assets/fonts/apricotsy.ttf',
});

export const openSans = Open_Sans({
  display: 'swap',
  subsets: ['latin'],
  weight: ['400', '600'],
});

export const brittanySignature = localFont({
  display: 'swap',
  src: '../assets/fonts/brittany-signature.woff2',
});

export const italiana = Italiana({
  display: 'swap',
  subsets: ['latin'],
  weight: ['400'],
});

export const kollektif = localFont({
  display: 'swap',
  src: '../assets/fonts/kollektif.woff2',
});

export const vidaloka = Vidaloka({
  subsets: ['latin'],
  weight: ['400'],
});
