import { Italiana, Poppins } from 'next/font/google';
import localFont from 'next/font/local';

export const poppins = Poppins({
  display: 'swap',
  subsets: ['latin'],
  weight: ['300', '400', '600'],
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
