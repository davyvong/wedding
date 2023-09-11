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
  useTransitionStyles,
} from '@floating-ui/react';
import classNames from 'classnames';
import { poppins } from 'client/fonts';
import Translate from 'client/translate';
import textInputStyles from 'components/form/text-input/component.module.css';
import LoadingHeart from 'components/loading-heart';
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
      shift({ padding: 32 }),
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
  const { getFloatingProps, getReferenceProps } = useInteractions([click, dismiss, focus]);
  const { isMounted, styles: transitionStyles } = useTransitionStyles(context);

  const fetchAddresses = useCallback(async (): Promise<string[]> => {
    try {
      if (!value) {
        return [];
      }
      const response = await fetch('/api/address?lookup=' + value);
      return response.json();
    } catch (error: unknown) {
      return [];
    }
  }, [value]);

  const { data: suggestionsData, isLoading: suggestionsLoading } = useSWR(
    '/api/address?lookup=' + value,
    fetchAddresses,
  );

  const suggestions = useMemo(() => suggestionsData || [], [suggestionsData]);

  const renderSuggestionItem = useCallback(
    (suggestion: string): JSX.Element => {
      const onClickSuggestion = () => {
        onChange(name, suggestion);
        setIsOpen(false);
      };
      return (
        <div
          className={classNames(styles.suggestionItem, inverse && styles.suggestionItemInverse)}
          key={suggestion}
          onClick={onClickSuggestion}
        >
          {suggestion}
        </div>
      );
    },
    [inverse, name, onChange],
  );

  const renderSuggestionList = useCallback(() => {
    if (suggestionsLoading) {
      return (
        <div className={styles.suggestionListLoading}>
          <LoadingHeart />
        </div>
      );
    }
    if (suggestions.length === 0) {
      return (
        <div className={styles.suggestionListEmpty}>
          {Translate.html('components.address-input.no-suggestions', { value })}
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
          poppins.className,
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
