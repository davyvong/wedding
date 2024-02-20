'use client';

import {
  FloatingFocusManager,
  autoUpdate,
  offset,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
  useTransitionStyles,
} from '@floating-ui/react';
import classNames from 'classnames';
import { createKeyDownHandler } from 'client/browser';
import { openSans } from 'client/fonts';
import Translate from 'client/translate';
import textInputStyles from 'components/form/text-input/component.module.css';
import { FC, Fragment, useCallback, useMemo, useState } from 'react';

import styles from './component.module.css';

export interface SelectOption {
  label: string;
  value: unknown;
}

interface SelectProps {
  className?: string;
  inverse?: boolean;
  name: string;
  onChange: (name: string, value: unknown) => void;
  options: SelectOption[];
  placeholder?: string;
  value: unknown;
}

const Select: FC<SelectProps> = ({ className, inverse = false, onChange, name, options, value, ...props }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { context, floatingStyles, refs } = useFloating({
    middleware: [
      offset(8),
      shift({ padding: 24 }),
      size({
        apply({ elements, rects }) {
          Object.assign(elements.floating.style, {
            width: rects.reference.width + 'px',
          });
        },
      }),
    ],
    onOpenChange: setIsOpen,
    open: isOpen,
    whileElementsMounted: autoUpdate,
  });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'select' });
  const { getFloatingProps, getReferenceProps } = useInteractions([click, dismiss, role]);
  const { isMounted, styles: transitionStyles } = useTransitionStyles(context);

  const renderOptionItem = useCallback(
    (option: SelectOption): JSX.Element => {
      const onClickOption = (): void => {
        onChange(name, option.value);
        setIsOpen(false);
      };
      return (
        <div
          aria-selected="false"
          className={classNames(styles.optionItem, inverse && styles.optionItemInverse)}
          key={option.label}
          onClick={onClickOption}
          onKeyDown={createKeyDownHandler(onClickOption)}
          role="option"
          tabIndex={0}
        >
          {option.label}
        </div>
      );
    },
    [inverse, name, onChange],
  );

  const renderOptionList = useCallback(() => {
    if (options.length === 0) {
      return Translate.t('components.select.no-options');
    }
    return options.map(renderOptionItem);
  }, [options, renderOptionItem]);

  const labelledValue = useMemo(
    () => options.find((option: SelectOption) => option.value === value)?.label || '',
    [options, value],
  );

  return (
    <Fragment>
      <input
        {...getReferenceProps()}
        {...props}
        className={classNames(
          textInputStyles.textInput,
          inverse && textInputStyles.textInputInverse,
          openSans.className,
          className,
        )}
        name={name}
        readOnly
        ref={refs.setReference}
        value={labelledValue}
      />
      {isMounted && (
        <FloatingFocusManager context={context}>
          <div
            {...getFloatingProps()}
            className={classNames(styles.optionList, inverse && styles.optionListInverse)}
            ref={refs.setFloating}
            style={{ ...floatingStyles, ...transitionStyles }}
          >
            {renderOptionList()}
          </div>
        </FloatingFocusManager>
      )}
    </Fragment>
  );
};

export default Select;
