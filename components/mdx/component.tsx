import classNames from 'classnames';
import type { FC, HTMLAttributes, ReactNode } from 'react';

import styles from './component.module.css';

interface MDXComponentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
}

const MDXComponent: FC<MDXComponentProps> = ({ children, className, ...props }) => (
  <div {...props} className={classNames(styles.mdx, className)}>
    {children}
  </div>
);

export default MDXComponent;
