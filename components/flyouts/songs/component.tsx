'use client';

import PlaylistRemoveIconSVG from 'assets/icons/playlist-remove.svg';
import classNames from 'classnames';
import { createKeyDownHandler } from 'client/browser';
import Translate from 'client/translate';
import type { FlyoutContentComponentProps } from 'components/flyout/component';
import rsvpFlyoutStyles from 'components/flyouts/rsvp/component.module.css';
import SongInput from 'components/form/song-input';
import LoadingHeart from 'components/loading-heart';
import Skeleton from 'components/skeleton';
import Tooltip from 'components/tooltip';
import Image from 'next/image';
import { useCallback, type FC, useState } from 'react';
import { SpotifyPlaylistTrack, SpotifyTrack } from 'server/apis/spotify';
import useSWR from 'swr';

import styles from './component.module.css';

interface SongsFlyoutComponentProps extends FlyoutContentComponentProps {}

const SongsFlyoutComponent: FC<SongsFlyoutComponentProps> = () => {
  const [query, setQuery] = useState<string>('');
  const [isRemoving, setIsRemoving] = useState<Set<string>>(new Set());

  const fetchSongRequests = useCallback(async (): Promise<SpotifyPlaylistTrack[]> => {
    const response = await fetch('/api/songs', {
      cache: 'no-store',
      method: 'GET',
    });
    return response.json();
  }, []);

  const { data, isLoading, mutate } = useSWR('/api/songs', fetchSongRequests);

  const createSongRequest = useCallback(
    async (song: SpotifyTrack): Promise<void> => {
      await fetch('/api/songs/' + song.id, {
        cache: 'no-store',
        method: 'POST',
      });
      mutate();
    },
    [mutate],
  );

  const removeSongRequest = useCallback(
    async (song: SpotifyTrack): Promise<void> => {
      setIsRemoving((prevState: Set<string>): Set<string> => {
        const nextState = new Set(prevState);
        nextState.add(song.id);
        return nextState;
      });
      try {
        await fetch('/api/songs/' + song.id, {
          cache: 'no-store',
          method: 'DELETE',
        });
        mutate();
      } finally {
        setIsRemoving((prevState: Set<string>): Set<string> => {
          const nextState = new Set(prevState);
          nextState.delete(song.id);
          return nextState;
        });
      }
    },
    [mutate],
  );

  const renderSong = useCallback(
    (song: SpotifyPlaylistTrack): JSX.Element => (
      <div className={classNames(styles.songCard, styles.songCardHoverable)} key={song.id}>
        <Image alt={song.name} className={styles.songImage} height={80} src={song.image} width={80} />
        <div className={styles.songInformation}>
          <a className={styles.songName} href={song.href} target="_blank">
            {song.name}
          </a>
          <div className={styles.songArtists}>
            {song.explicit && (
              <span className={styles.songExplicit}>{Translate.t('components.flyouts.songs.explicit')}</span>
            )}
            <span>{song.artists.join(', ')}</span>
          </div>
        </div>
        {isRemoving.has(song.id) ? (
          <LoadingHeart />
        ) : (
          <Tooltip
            placement="left-middle"
            renderContent={(): string => Translate.t('components.flyouts.songs.tooltips.remove')}
          >
            <button
              className={styles.removeButton}
              onClick={(): void => {
                removeSongRequest(song);
              }}
              onKeyDown={createKeyDownHandler((): void => {
                removeSongRequest(song);
              })}
            >
              <PlaylistRemoveIconSVG />
            </button>
          </Tooltip>
        )}
      </div>
    ),
    [isRemoving, removeSongRequest],
  );

  const renderSongSkeleton = useCallback(
    ([nameWidth, artistsWidth]: string[], index: number): JSX.Element => (
      <div className={styles.songCard} key={index}>
        <Skeleton className={styles.songImage} height={80} inverse width={80} />
        <div className={styles.songInformation}>
          <Skeleton height="1.125rem" inverse width={nameWidth} />
          <Skeleton height="1rem" inverse style={{ marginTop: '1rem' }} width={artistsWidth} />
        </div>
      </div>
    ),
    [],
  );

  if (isLoading) {
    const randomNameAndArtistsWidths = new Array(5)
      .fill(undefined)
      .map((): string[] => [
        (50 + Math.ceil(Math.random() * 50)).toString() + '%',
        (25 + Math.ceil(Math.random() * 50)).toString() + '%',
      ]);
    return (
      <div className={rsvpFlyoutStyles.content}>
        <Skeleton height="2.5rem" inverse width={300} />
        <Skeleton height="6rem" inverse style={{ marginTop: '2rem' }} width="100%" />
        <div style={{ marginTop: '2rem' }}>{randomNameAndArtistsWidths.map(renderSongSkeleton)}</div>
      </div>
    );
  }

  return (
    <div className={rsvpFlyoutStyles.content}>
      <div className={rsvpFlyoutStyles.title}>{Translate.t('components.flyouts.songs.title')}</div>
      <div className={styles.search}>
        {Translate.t('components.flyouts.songs.description')}
        <div className={styles.searchInput}>
          <SongInput
            name="search"
            onChange={(name: string, value: string): void => {
              setQuery(value);
            }}
            onSelect={createSongRequest}
            placeholder={Translate.t('components.flyouts.songs.placeholders.search')}
            value={query}
          />
        </div>
      </div>
      {Array.isArray(data) && <div className={styles.songList}>{data.map(renderSong)}</div>}
    </div>
  );
};

export default SongsFlyoutComponent;
