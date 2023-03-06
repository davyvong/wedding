import type { CSSProperties, FC } from 'react';

import styles from './component.module.css';

interface ColorfulBackdropProps {
  blobStyle: CSSProperties;
  hasFilterSupport: boolean;
}

const ColorfulBackdropComponent: FC<ColorfulBackdropProps> = ({ blobStyle, hasFilterSupport }) => {
  if (!hasFilterSupport) {
    return null;
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.blob} style={blobStyle} />
      <div className={styles.blur} />
    </div>
  );
};

export default ColorfulBackdropComponent;
