import localFont from 'next/font/local';
import { Fragment } from 'react';

import styles from './page.module.css';
import Image from 'next/image';
import classNames from 'classnames';

const brittanySignatureFont = localFont({
  display: 'swap',
  src: '../public/fonts/brittany-signature.woff2',
});

const kollektifFont = localFont({
  display: 'swap',
  src: '../public/fonts/kollektif.woff2',
});

const playfairDislayFont = localFont({
  display: 'swap',
  src: '../public/fonts/playfair-display.woff2',
});

const Page = async (): Promise<JSX.Element> => (
  <Fragment>
    <Image alt="" className={styles.imageBackdrop} fill src="/images/VD-72.jpg" />
    <div className={styles.textOverlay}>
      <div className={classNames(brittanySignatureFont.className, styles.saveTheDate)}>Save the date</div>
      <div className={classNames(playfairDislayFont.className, styles.names)}>Vivian & Davy</div>
      <div className={classNames(kollektifFont.className, styles.date)}>23 . 06 . 2024</div>
    </div>
  </Fragment>
);

export default Page;
