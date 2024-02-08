'use client';

import QueueMusicIconSVG from 'assets/icons/queue-music.svg';
import Translate from 'client/translate';
import Button from 'components/button';
import Flyout from 'components/flyout';
import { FlyoutContentComponentProps, FlyoutReferenceComponentProps } from 'components/flyout/component';
import rsvpFlyoutStyles from 'components/flyouts/rsvp/index.module.css';
import { FC } from 'react';

import SongsFlyoutComponent from './component';

const SongsFlyout: FC = () => {
  const renderContent = (contentProps: FlyoutContentComponentProps): JSX.Element => (
    <SongsFlyoutComponent {...contentProps} />
  );

  const renderReference = (referenceProps: FlyoutReferenceComponentProps): JSX.Element => (
    <Button {...referenceProps}>
      <QueueMusicIconSVG />
      <span className={rsvpFlyoutStyles.buttonText}>
        {Translate.t('components.flyouts.songs.buttons.song-requests')}
      </span>
    </Button>
  );

  return <Flyout openWithURLParam="songs" renderContent={renderContent} renderReference={renderReference} />;
};

export default SongsFlyout;
