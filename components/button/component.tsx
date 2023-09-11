import classNames from 'classnames';
import { forwardRef, type ButtonHTMLAttributes, RefObject } from 'react';

import styles from './component.module.css';

interface ButtonComponentProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  inverse?: boolean;
}

const ButtonComponent = forwardRef(
  ({ className, inverse, ...props }: ButtonComponentProps, ref: RefObject<HTMLButtonElement>) => (
    <button
      className={classNames(styles.button, inverse && styles.buttonInverse, className)}
      ref={ref}
      type="button"
      {...props}
    />
  ),
);

ButtonComponent.displayName = 'ButtonComponent';

export default ButtonComponent;
