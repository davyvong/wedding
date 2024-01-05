import classNames from 'classnames';
import { CSSProperties, FC } from 'react';

import styles from './component.module.css';

export interface SkeletonComponentProps {
  className?: string;
  height?: number | string;
  inverse?: boolean;
  style?: CSSProperties;
  width?: number | string;
}

const SkeletonComponent: FC<SkeletonComponentProps> = ({ className, height, inverse = false, style = {}, width }) => {
  return (
    <div
      className={classNames(styles.skeleton, inverse && styles.skeletonInverse, className)}
      style={{ height, width, ...style }}
    />
  );
};

export default SkeletonComponent;
