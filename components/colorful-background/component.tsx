import type { CSSProperties, FC } from 'react';

import styles from './component.module.css';

interface ColorfulBackgroundProps {
  blobStyle: CSSProperties;
}

const ColorfulBackgroundComponent: FC<ColorfulBackgroundProps> = ({ blobStyle }) => (
  <div className={styles.background}>
    <div className={styles.blob} style={blobStyle} />
    <div className={styles.blur} />
  </div>
);

export default ColorfulBackgroundComponent;
