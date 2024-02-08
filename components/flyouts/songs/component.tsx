'use client';

import OpenInNewIconSVG from 'assets/icons/open-in-new.svg';
import type { FlyoutContentComponentProps } from 'components/flyout/component';
import { useCallback, type FC } from 'react';
import rsvpFlyoutStyles from 'components/flyouts/rsvp/component.module.css';
import { SpotifyPlaylist, SpotifyPlaylistTrack } from 'server/apis/spotify';
import useSWR from 'swr';
import Image from 'next/image';
import Translate from 'client/translate';
import Skeleton from 'components/skeleton';

import styles from './component.module.css';

interface SongsFlyoutComponentProps extends FlyoutContentComponentProps {}

const SongsFlyoutComponent: FC<SongsFlyoutComponentProps> = () => {
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
          <div className={styles.songCardName}>
            <a href={song.href} target="_blank">
              {song.name}
            </a>
            <OpenInNewIconSVG className={styles.songCardNameIcon} height={20} width={20} />
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
        <Skeleton className={styles.songCardImage} height={80} inverse width={80} />
        <div className={styles.songCardInformation}>
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
      {data ? data.tracks.map(renderSong) : Translate.t('components.flyouts.songs.no-songs')}
    </div>
  );
};

export default SongsFlyoutComponent;
