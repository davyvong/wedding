import classNames from 'classnames';
import Image from 'next/image';
import type { FC, ReactElement } from 'react';

import styles from './layout.module.css';

interface LayoutProps {
  children: ReactElement;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.container}>
      <div className={classNames(styles.section, styles.photo)}>
        <Image
          alt=""
          fill
          quality={80}
          src="https://images.unsplash.com/photo-1519307212971-dd9561667ffb?auto=format&fit=crop&w=2787&q=80"
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className={styles.section}>{children}</div>
    </div>
  );
};

export default Layout;
