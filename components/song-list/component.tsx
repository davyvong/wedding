'use client';

import Translate from 'client/translate';
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
          <div className={styles.songCardName}>{song.name}</div>
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

  if (isLoading) {
    return <div className={styles.songList}></div>;
  }

  if (!data) {
    return <div className={styles.songList}></div>;
  }

  return <div className={styles.songList}>{data.tracks.map(renderSong)}</div>;
};

export default SongListComponent;
