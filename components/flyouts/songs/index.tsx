'use client';

import QueueMusicIconSVG from 'assets/icons/queue-music.svg';
import Translate from 'client/translate';
import Button from 'components/button';
import Flyout from 'components/flyout';
import { FlyoutContentComponentProps, FlyoutReferenceComponentProps } from 'components/flyout/component';
import rsvpFlyoutStyles from 'components/flyouts/rsvp/index.module.css';
import { FC } from 'react';

import SongsFlyoutComponent from './component';

interface SongsFlyoutProps {
  renderReference?: (referenceProps: FlyoutReferenceComponentProps) => JSX.Element;
}

const SongsFlyout: FC<SongsFlyoutProps> = ({ renderReference }) => {
  const renderContent = (contentProps: FlyoutContentComponentProps): JSX.Element => (
    <SongsFlyoutComponent {...contentProps} />
  );

  const renderDefaultReference = (referenceProps: FlyoutReferenceComponentProps): JSX.Element => (
    <Button {...referenceProps}>
      <QueueMusicIconSVG />
      <span className={rsvpFlyoutStyles.buttonText}>{Translate.t('components.flyouts.songs.song-requests')}</span>
    </Button>
  );

  return (
    <Flyout
      openWithURLParam="songs"
      renderContent={renderContent}
      renderReference={renderReference || renderDefaultReference}
    />
  );
};

export default SongsFlyout;
