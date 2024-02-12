'use client';

import Flyout from 'components/flyout';
import { FlyoutContentComponentProps, FlyoutReferenceComponentProps } from 'components/flyout/component';
import { FC } from 'react';

import InvitationFlyoutComponent from './component';

interface InvitationFlyoutProps {
  renderReference: (referenceProps: FlyoutReferenceComponentProps) => JSX.Element;
}

const InvitationFlyout: FC<InvitationFlyoutProps> = ({ renderReference }) => {
  const renderContent = (contentProps: FlyoutContentComponentProps): JSX.Element => (
    <InvitationFlyoutComponent {...contentProps} />
  );

  return <Flyout openWithURLParam="invitation" renderContent={renderContent} renderReference={renderReference} />;
};

export default InvitationFlyout;
