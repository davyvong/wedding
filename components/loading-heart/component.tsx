import classNames from 'classnames';
import type { FC } from 'react';

import styles from './component.module.css';

interface LoadingHeartProps {
  className?: string;
  inverse?: boolean;
}

const LoadingHeart: FC<LoadingHeartProps> = ({ className, inverse = false }) => (
  <div className={classNames(styles.loadingHeart, inverse && styles.loadingHeartInverse, className)}>
    <div />
  </div>
);

export default LoadingHeart;
