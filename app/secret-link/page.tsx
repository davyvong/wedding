import classNames from 'classnames';
import SecretLinkForm from 'components/secret-link-form';
import Image from 'next/image';

import styles from './page.module.css';

const Page = async (): Promise<JSX.Element> => {
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
      <div className={styles.section}>
        <SecretLinkForm />
      </div>
    </div>
  );
};

export default Page;
