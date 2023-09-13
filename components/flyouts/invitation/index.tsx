'use client';

import MarkEmailUnreadSVG from 'assets/icons/mark-email-unread.svg';
import Translate from 'client/translate';
import Button from 'components/button';
import Flyout from 'components/flyout';
import { FlyoutContentComponentProps, FlyoutReferenceComponentProps } from 'components/flyout/component';
import rsvpFlyoutStyles from 'components/flyouts/rsvp/index.module.css';
import { FC } from 'react';

import GuestListFlyoutComponent from './component';

const GuestListFlyout: FC = () => {
  const renderContent = (contentProps: FlyoutContentComponentProps): JSX.Element => (
    <GuestListFlyoutComponent {...contentProps} />
  );

  const renderReference = (referenceProps: FlyoutReferenceComponentProps): JSX.Element => (
    <Button {...referenceProps}>
      <MarkEmailUnreadSVG />
      <span className={rsvpFlyoutStyles.buttonText}>
        {Translate.t('components.flyouts.invitation.buttons.invitation')}
      </span>
    </Button>
  );

  return <Flyout openWithURLParam="guest-invitation" renderContent={renderContent} renderReference={renderReference} />;
};

export default GuestListFlyout;
