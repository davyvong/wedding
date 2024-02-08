'use client';

import OpenInNewIconSVG from 'assets/icons/open-in-new.svg';
import Translate from 'client/translate';
import Skeleton from 'components/skeleton';
import type { FlyoutContentComponentProps } from 'components/flyout/component';
import rsvpFlyoutStyles from 'components/flyouts/rsvp/component.module.css';
import SongInput from 'components/form/song-input';
import Image from 'next/image';
import { useCallback, type FC, useState } from 'react';
import { SpotifyPlaylist, SpotifyPlaylistTrack, SpotifyTrack } from 'server/apis/spotify';
import useSWR from 'swr';

import styles from './component.module.css';

interface SongsFlyoutComponentProps extends FlyoutContentComponentProps {}

const SongsFlyoutComponent: FC<SongsFlyoutComponentProps> = () => {
  const [query, setQuery] = useState<string>('');

  const fetchSpotifyPlaylist = useCallback(async (): Promise<SpotifyPlaylist> => {
    const response = await fetch('/api/spotify/playlist', {
      cache: 'no-store',
      method: 'GET',
    });
    return response.json();
  }, []);

  const { data, isLoading } = useSWR('/api/spotify/playlist', fetchSpotifyPlaylist);

  const renderSong = useCallback(
    (song: SpotifyPlaylistTrack): JSX.Element => (
      <div className={styles.songCard} key={song.id}>
        <Image alt={song.name} className={styles.songImage} height={80} src={song.image} width={80} />
        <div className={styles.songInformation}>
          <div className={styles.songName}>
            <a href={song.href} target="_blank">
              {song.name}
            </a>
            <OpenInNewIconSVG className={styles.songNameIcon} height={20} width={20} />
          </div>
          <div className={styles.songArtists}>
            {song.explicit && (
              <span className={styles.songExplicit}>{Translate.t('components.flyouts.songs.explicit')}</span>
            )}
            <span>{song.artists.join(', ')}</span>
          </div>
        </div>
      </div>
    ),
    [],
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
    const randomNameAndArtistsWidths = new Array(7)
      .fill(undefined)
      .map((): string[] => [
        (50 + Math.ceil(Math.random() * 50)).toString() + '%',
        (25 + Math.ceil(Math.random() * 50)).toString() + '%',
      ]);
    return <div className={rsvpFlyoutStyles.content}>{randomNameAndArtistsWidths.map(renderSongSkeleton)}</div>;
  }

  return (
    <div className={rsvpFlyoutStyles.content}>
      <div className={rsvpFlyoutStyles.title}>{Translate.t('components.flyouts.songs.song-requests')}</div>
      <div className={styles.search}>
        {Translate.t('components.flyouts.songs.description')}
        <div className={styles.searchInput}>
          <SongInput
            name="search"
            onChange={(name: string, value: string): void => {
              setQuery(value);
            }}
            onSelect={(value: SpotifyTrack): void => {
              console.log(value);
            }}
            placeholder={Translate.t('components.flyouts.songs.placeholders.search')}
            value={query}
          />
        </div>
      </div>
      {data ? (
        <div className={styles.songList}>{data.tracks.map(renderSong)}</div>
      ) : (
        Translate.t('components.flyouts.songs.no-songs')
      )}
    </div>
  );
};

export default SongsFlyoutComponent;
