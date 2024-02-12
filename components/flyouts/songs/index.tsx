'use client';

import Flyout from 'components/flyout';
import { FlyoutContentComponentProps, FlyoutReferenceComponentProps } from 'components/flyout/component';
import { FC } from 'react';

import SongsFlyoutComponent from './component';

interface SongsFlyoutProps {
  renderReference: (referenceProps: FlyoutReferenceComponentProps) => JSX.Element;
}

const SongsFlyout: FC<SongsFlyoutProps> = ({ renderReference }) => {
  const renderContent = (contentProps: FlyoutContentComponentProps): JSX.Element => (
    <SongsFlyoutComponent {...contentProps} />
  );

  return <Flyout openWithURLParam="songs" renderContent={renderContent} renderReference={renderReference} />;
};

export default SongsFlyout;
