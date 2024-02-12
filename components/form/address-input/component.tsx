'use client';

import {
  autoUpdate,
  offset,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useFocus,
  useInteractions,
  useRole,
  useTransitionStyles,
} from '@floating-ui/react';
import classNames from 'classnames';
import { openSans } from 'client/fonts';
import Translate from 'client/translate';
import textInputStyles from 'components/form/text-input/component.module.css';
import Skeleton from 'components/skeleton';
import { FC, Fragment, useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';

import styles from './component.module.css';

interface AddressInputComponentProps {
  className?: string;
  inverse?: boolean;
  name: string;
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  value: string;
}

const AddressInputComponent: FC<AddressInputComponentProps> = ({
  className,
  inverse = false,
  onChange,
  name,
  value,
  ...props
}) => {
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
  const focus = useFocus(context);
  const role = useRole(context, { role: 'select' });
  const { getFloatingProps, getReferenceProps } = useInteractions([click, dismiss, focus, role]);
  const { isMounted, styles: transitionStyles } = useTransitionStyles(context);

  const fetchAddresses = useCallback(async (): Promise<string[]> => {
    try {
      const response = await fetch('/api/address/search?lookup=' + value);
      return response.json();
    } catch {
      return [];
    }
  }, [value]);

  const { data: suggestionsData, isLoading: suggestionsLoading } = useSWR(
    value ? '/api/address/search?lookup=' + value : null,
    fetchAddresses,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const suggestions = useMemo(() => suggestionsData || [], [suggestionsData]);

  const renderSuggestionItem = useCallback(
    (suggestion: string): JSX.Element => {
      const onClickSuggestion = (): void => {
        onChange(name, suggestion);
        setIsOpen(false);
      };
      const onKeyDownSuggestion = (event): boolean => {
        if (event.keyCode === 13) {
          event.stopPropagation();
          onClickSuggestion();
          return false;
        }
        return true;
      };
      return (
        <div
          aria-selected="false"
          className={classNames(styles.suggestionItem, inverse && styles.suggestionItemInverse)}
          key={suggestion}
          onClick={onClickSuggestion}
          onKeyDown={onKeyDownSuggestion}
          role="option"
          tabIndex={0}
        >
          {suggestion}
        </div>
      );
    },
    [inverse, name, onChange],
  );

  const renderSuggestionList = useCallback(() => {
    if (suggestionsLoading) {
      const randomSuggestionWidths = new Array(5)
        .fill(undefined)
        .map((): string => (50 + Math.ceil(Math.random() * 50)).toString() + '%');
      return (
        <div className={styles.suggestionListLoading}>
          {randomSuggestionWidths.map(
            (width: string, index: number): JSX.Element => (
              <Skeleton
                height="1.5rem"
                inverse
                key={index}
                style={index > 0 ? { marginTop: '1.5rem' } : undefined}
                width={width}
              />
            ),
          )}
        </div>
      );
    }
    if (suggestions.length === 0) {
      return (
        <div className={styles.suggestionListEmpty}>
          {Translate.html('components.form.address-input.no-suggestions', { value })}
        </div>
      );
    }
    return suggestions.map(renderSuggestionItem);
  }, [renderSuggestionItem, suggestions, suggestionsLoading, value]);

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
        onChange={event => onChange(name, event.target.value)}
        name={name}
        ref={refs.setReference}
        value={value}
      />
      {value && isMounted && (
        <div
          {...getFloatingProps()}
          className={classNames(styles.suggestionList, inverse && styles.suggestionListInverse)}
          ref={refs.setFloating}
          style={{ ...floatingStyles, ...transitionStyles }}
        >
          {renderSuggestionList()}
        </div>
      )}
    </Fragment>
  );
};

export default AddressInputComponent;
