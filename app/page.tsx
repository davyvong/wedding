import classNames from 'classnames';
import Gallery from 'components/gallery';
import navigationStyles from 'components/navigation/component.module.css';
import { Fragment } from 'react';

import { galleryImageList } from './constants';
import styles from './page.module.css';

const Page = async (): Promise<JSX.Element> => (
  <Fragment>
    <style>{`.${navigationStyles.content} { background-color: var(--color-surface-variant); }`}</style>
    <div className={styles.container}>
      <div className={classNames(styles.section, styles.saveTheDate)} />
      <div className={styles.section}>
        <Gallery data={galleryImageList} />
      </div>
    </div>
  </Fragment>
);

export default Page;
