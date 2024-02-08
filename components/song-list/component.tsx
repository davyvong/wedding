'use client';

import Translate from 'client/translate';
import Skeleton from 'components/skeleton';
import Image from 'next/image';
import { FC, useCallback } from 'react';
import { SpotifyPlaylist, SpotifyPlaylistTrack } from 'server/apis/spotify';
import useSWR from 'swr';

import styles from './component.module.css';

const SongListComponent: FC = () => {
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
        <Image alt={song.name} className={styles.songCardImage} height={80} src={song.image} width={80} />
        <div className={styles.songCardInformation}>
          <a className={styles.songCardName} href={song.href} target="_blank">
            {song.name}
          </a>
          <div className={styles.songArtists}>
            {song.explicit && (
              <span className={styles.songExplicit}>{Translate.t('components.song-list.explicit')}</span>
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
        <Skeleton className={styles.songCardImage} height={80} width={80} />
        <div className={styles.songCardInformation}>
          <Skeleton height="1.125rem" width={nameWidth} />
          <Skeleton height="1rem" style={{ marginTop: '1rem' }} width={artistsWidth} />
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

    return <div className={styles.songList}>{randomNameAndArtistsWidths.map(renderSongSkeleton)}</div>;
  }

  return (
    <div className={styles.songList}>
      {data ? data.tracks.map(renderSong) : Translate.t('components.song-list.no-songs')}
    </div>
  );
};

export default SongListComponent;
