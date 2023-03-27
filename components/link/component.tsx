import classNames from 'classnames';
import NextLink from 'next/link';
import type { LinkProps } from 'next/link';
import type { FC } from 'react';

import styles from './component.module.css';

interface LinkComponentProps extends LinkProps {
  className?: string;
  text: string;
}

const LinkComponent: FC<LinkComponentProps> = ({ className, text, ...props }) => (
  <NextLink {...props} className={classNames(styles.link, className)}>
    <span>{text}</span>
  </NextLink>
);

export default LinkComponent;
