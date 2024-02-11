'use client';

import MarkEmailUnreadIconSVG from 'assets/icons/mark-email-unread.svg';
import Translate from 'client/translate';
import Button from 'components/button';
import Flyout from 'components/flyout';
import { FlyoutContentComponentProps, FlyoutReferenceComponentProps } from 'components/flyout/component';
import rsvpFlyoutStyles from 'components/flyouts/rsvp/index.module.css';
import { FC } from 'react';

import InvitationFlyoutComponent from './component';

interface InvitationFlyoutProps {
  renderReference?: (referenceProps: FlyoutReferenceComponentProps) => JSX.Element;
}

const InvitationFlyout: FC<InvitationFlyoutProps> = ({ renderReference }) => {
  const renderContent = (contentProps: FlyoutContentComponentProps): JSX.Element => (
    <InvitationFlyoutComponent {...contentProps} />
  );

  const renderDefaultReference = (referenceProps: FlyoutReferenceComponentProps): JSX.Element => (
    <Button {...referenceProps}>
      <MarkEmailUnreadIconSVG />
      <span className={rsvpFlyoutStyles.buttonText}>
        {Translate.t('components.flyouts.invitation.buttons.invitation')}
      </span>
    </Button>
  );

  return (
    <Flyout
      openWithURLParam="invitation"
      renderContent={renderContent}
      renderReference={renderReference || renderDefaultReference}
    />
  );
};

export default InvitationFlyout;
