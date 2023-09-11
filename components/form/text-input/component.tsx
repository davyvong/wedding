import classNames from 'classnames';
import { poppins } from 'client/fonts';
import type { InputHTMLAttributes } from 'react';

import styles from './component.module.css';

interface TextInputComponentProps extends InputHTMLAttributes<HTMLInputElement> {
  inverse?: boolean;
}

const TextInputComponent = ({ className, inverse = false, ...props }: TextInputComponentProps): JSX.Element => (
  <input
    {...props}
    className={classNames(styles.textInput, inverse && styles.textInputInverse, poppins.className, className)}
  />
);

export default TextInputComponent;
