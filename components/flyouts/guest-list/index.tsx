'use client';

import Translate from 'client/translate';
import Button from 'components/button';
import Flyout from 'components/flyout';
import { FlyoutContentComponentProps, FlyoutReferenceComponentProps } from 'components/flyout/component';
import { FC } from 'react';

import GuestListFlyoutComponent from './component';

const GuestListFlyout: FC = () => {
  const renderContent = (contentProps: FlyoutContentComponentProps): JSX.Element => (
    <GuestListFlyoutComponent {...contentProps} />
  );

  const renderReference = (referenceProps: FlyoutReferenceComponentProps): JSX.Element => (
    <Button {...referenceProps}>{Translate.t('components.flyouts.guest-list.buttons.check-guest-invitation')}</Button>
  );

  return <Flyout openWithURLParam="guest-invitation" renderContent={renderContent} renderReference={renderReference} />;
};

export default GuestListFlyout;
