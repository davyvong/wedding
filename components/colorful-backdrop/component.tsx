import { forwardRef } from 'react';
import type { CSSProperties, FC, RefObject } from 'react';

import styles from './component.module.css';

interface ColorfulBackdropProps {
  blobStyle: CSSProperties;
  style?: CSSProperties;
}

const ColorfulBackdropComponent: FC<ColorfulBackdropProps> = forwardRef(
  ({ blobStyle, style }, ref: RefObject<HTMLDivElement>) => (
    <div className={styles.backdrop} ref={ref} style={style}>
      <div className={styles.blob} style={blobStyle} />
      <div className={styles.blur} />
    </div>
  ),
);

ColorfulBackdropComponent.displayName = 'ColorfulBackdropComponent';

export default ColorfulBackdropComponent;
