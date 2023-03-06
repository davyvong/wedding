'use client';

import classNames from 'classnames';
import { Fragment } from 'react';
import type { FC } from 'react';

import styles from './page.module.css';

const Page: FC = () => (
  <Fragment>
    <div className={styles.hero}>
      <figure className={styles.figure}>
        <div className={classNames(styles.title, styles.saveTheDate)}>Save The Date</div>
        <div className={classNames(styles.title, styles.weddingDate)}>June 24, 2024</div>
      </figure>
    </div>
  </Fragment>
);

export default Page;
