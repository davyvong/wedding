import classNames from 'classnames';
import { openSans } from 'client/fonts';
import type { TextareaHTMLAttributes } from 'react';

import styles from './component.module.css';

interface TextareaComponentProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  inverse?: boolean;
}

const TextareaComponent = ({ className, inverse = false, value, ...props }: TextareaComponentProps): JSX.Element => (
  <div className={classNames(styles.container, inverse && styles.containerInverse)}>
    <div className={styles.hiddenValue}>{value + ' '}</div>
    <textarea
      {...props}
      className={classNames(styles.textarea, inverse && styles.textareaInverse, openSans.className, className)}
      value={value}
    />
  </div>
);

export default TextareaComponent;
