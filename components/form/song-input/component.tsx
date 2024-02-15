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
import CloseIconSVG from 'assets/icons/close.svg';
import SearchIconSVG from 'assets/icons/search.svg';
import classNames from 'classnames';
import { openSans } from 'client/fonts';
import Translate from 'client/translate';
import songFlyoutStyles from 'components/flyouts/songs/component.module.css';
import addressInputStyles from 'components/form/address-input/component.module.css';
import textInputStyles from 'components/form/text-input/component.module.css';
import Skeleton from 'components/skeleton';
import Tooltip from 'components/tooltip';
import useDebounce from 'hooks/useDebounce';
import Image from 'next/image';
import { FC, Fragment, useCallback, useMemo, useState } from 'react';
import { SpotifyTrack } from 'server/apis/spotify';
import useSWR from 'swr';

import styles from './component.module.css';

interface SongInputComponentProps {
  className?: string;
  inverse?: boolean;
  name: string;
  onChange: (name: string, value: string) => void;
  onSelect: (value: SpotifyTrack) => void;
  placeholder?: string;
  value: string;
}

const SongInputComponent: FC<SongInputComponentProps> = ({
  className,
  inverse = false,
  name,
  onChange,
  onSelect,
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

  const debouncedValue = useDebounce<string>(value, 1000);
  const hasValueChanged = useMemo<boolean>(() => value !== debouncedValue, [debouncedValue, value]);

  const fetchSongs = useCallback(async (): Promise<SpotifyTrack[]> => {
    try {
      const response = await fetch('/api/spotify/search?query=' + debouncedValue);
      return response.json();
    } catch {
      return [];
    }
  }, [debouncedValue]);

  const { data: suggestionsData, isLoading: suggestionsLoading } = useSWR(
    debouncedValue ? '/api/spotify/search?query=' + debouncedValue : null,
    fetchSongs,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const suggestions = useMemo(() => suggestionsData || [], [suggestionsData]);

  const renderSuggestionItem = useCallback(
    (suggestion: SpotifyTrack): JSX.Element => {
      const onClickSuggestion = (): void => {
        onChange(name, '');
        onSelect(suggestion);
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
          className={classNames(
            addressInputStyles.suggestionItem,
            inverse && addressInputStyles.suggestionItemInverse,
            songFlyoutStyles.songCard,
            styles.songCard,
          )}
          key={suggestion.id}
          onClick={onClickSuggestion}
          onKeyDown={onKeyDownSuggestion}
          role="option"
          tabIndex={0}
        >
          <Image
            alt={suggestion.name}
            className={songFlyoutStyles.songImage}
            height={64}
            src={suggestion.image}
            width={64}
          />
          <div className={classNames(songFlyoutStyles.songInformation, styles.songInformation)}>
            <div className={classNames(songFlyoutStyles.songName, styles.songName)}>{suggestion.name}</div>
            <div className={classNames(songFlyoutStyles.songArtists, styles.songArtists)}>
              {suggestion.explicit && (
                <span className={songFlyoutStyles.songExplicit}>
                  {Translate.t('components.flyouts.songs.explicit')}
                </span>
              )}
              <span>{suggestion.artists.join(', ')}</span>
            </div>
          </div>
        </div>
      );
    },
    [inverse, name, onChange, onSelect],
  );

  const randomNameAndArtistsWidths = useMemo<string[][]>(
    () =>
      new Array(3)
        .fill(undefined)
        .map((): string[] => [
          (50 + Math.ceil(Math.random() * 50)).toString() + '%',
          (25 + Math.ceil(Math.random() * 50)).toString() + '%',
        ]),
    [],
  );

  const renderSongSkeleton = useCallback(
    ([nameWidth, artistsWidth]: string[], index: number): JSX.Element => (
      <div className={classNames(songFlyoutStyles.songCard, styles.songSkeleton)} key={index}>
        <Skeleton className={songFlyoutStyles.songImage} inverse />
        <div className={classNames(songFlyoutStyles.songInformation, styles.songInformation)}>
          <Skeleton height="1rem" inverse width={nameWidth} />
          <Skeleton height="0.875rem" inverse style={{ marginTop: '1rem' }} width={artistsWidth} />
        </div>
      </div>
    ),
    [],
  );

  const renderSuggestionList = useCallback(() => {
    if (hasValueChanged || suggestionsLoading) {
      return (
        <div className={classNames(addressInputStyles.suggestionListLoading, styles.suggestionListLoading)}>
          {randomNameAndArtistsWidths.map(renderSongSkeleton)}
        </div>
      );
    }
    if (suggestions.length === 0) {
      return (
        <div className={addressInputStyles.suggestionListEmpty}>
          {Translate.html('components.form.song-input.no-suggestions', { value })}
        </div>
      );
    }
    return suggestions.map(renderSuggestionItem);
  }, [
    hasValueChanged,
    randomNameAndArtistsWidths,
    renderSongSkeleton,
    renderSuggestionItem,
    suggestions,
    suggestionsLoading,
    value,
  ]);

  return (
    <Fragment>
      <div className={styles.inputWrapper}>
        <input
          {...getReferenceProps()}
          {...props}
          className={classNames(
            textInputStyles.textInput,
            inverse && textInputStyles.textInputInverse,
            styles.textInput,
            openSans.className,
            className,
          )}
          onChange={event => onChange(name, event.target.value)}
          ref={refs.setReference}
          value={value}
        />
        <SearchIconSVG className={styles.searchIcon} />
        {value.length > 0 && (
          <Tooltip
            inverse
            placement="left-middle"
            renderContent={(): string => Translate.t('components.form.song-input.tooltips.clear')}
          >
            <button className={styles.clearButton} onClick={(): void => onChange(name, '')} tabIndex={-1}>
              <CloseIconSVG height={24} width={24} />
            </button>
          </Tooltip>
        )}
      </div>
      {value && isMounted && (
        <div
          {...getFloatingProps()}
          className={classNames(
            addressInputStyles.suggestionList,
            inverse && addressInputStyles.suggestionListInverse,
            styles.suggestionList,
          )}
          ref={refs.setFloating}
          style={{ ...floatingStyles, ...transitionStyles }}
        >
          {renderSuggestionList()}
        </div>
      )}
    </Fragment>
  );
};

export default SongInputComponent;
