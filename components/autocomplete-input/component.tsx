'use client';

import {
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useTransitionStyles,
} from '@floating-ui/react';
import LoadingHeart from 'components/loading-heart';
import useTranslate from 'hooks/translate';
import { FC, Fragment, useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';

import styles from './component.module.css';

interface AutocompleteInputProps {
  name: string;
  onChange: (name: string, value: string) => void;
  value: string;
}

const AutocompleteInput: FC<AutocompleteInputProps> = ({ onChange, name, value }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { html } = useTranslate();
  const { context, floatingStyles, refs } = useFloating({
    middleware: [offset(8), shift({ padding: 32 })],
    onOpenChange: setIsOpen,
    open: isOpen,
  });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getFloatingProps, getReferenceProps } = useInteractions([click, dismiss]);
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
        <div className={styles.suggestionItem} key={suggestion} onClick={onClickSuggestion}>
          {suggestion}
        </div>
      );
    },
    [name, onChange],
  );

  const renderSuggestionList = useCallback(() => {
    if (suggestionsLoading) {
      return (
        <center>
          <LoadingHeart />
        </center>
      );
    }
    if (suggestions.length === 0) {
      return html('components.autocomplete-input.no-suggestions', { value });
    }
    return suggestions.map(renderSuggestionItem);
  }, [html, renderSuggestionItem, suggestions, suggestionsLoading, value]);

  return (
    <Fragment>
      <input
        {...getReferenceProps()}
        onChange={event => onChange(name, event.target.value)}
        name={name}
        ref={refs.setReference}
        value={value}
      />
      {value && isMounted && (
        <div
          {...getFloatingProps()}
          className={styles.suggestionList}
          ref={refs.setFloating}
          style={{ ...floatingStyles, ...transitionStyles }}
        >
          {renderSuggestionList()}
        </div>
      )}
    </Fragment>
  );
};

export default AutocompleteInput;
