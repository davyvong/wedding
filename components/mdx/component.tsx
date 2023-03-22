import classNames from 'classnames';
import type { FC, HTMLAttributes, ReactElement } from 'react';

import styles from './component.module.css';

interface MDXComponentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactElement;
  className?: string;
}

const MDXComponent: FC<MDXComponentProps> = ({ children, className, ...props }) => (
  <div {...props} className={classNames(styles.mdx, className)}>
    {children}
  </div>
);

export default MDXComponent;
