'use client';

import MarkEmailReadIconSVG from 'assets/icons/mark-email-read.svg';
import Translate from 'client/translate';
import Button from 'components/button';
import Flyout from 'components/flyout';
import { FlyoutContentComponentProps, FlyoutReferenceComponentProps } from 'components/flyout/component';
import { FC, useCallback, useState } from 'react';
import { GuestTokenPayload } from 'server/authenticator';

import RSVPFlyoutComponent from './component';
import styles from './index.module.css';

interface RSVPFlyoutProps {
  openWithURLParam?: string;
  renderReference?: (referenceProps: FlyoutReferenceComponentProps) => JSX.Element;
  token: GuestTokenPayload;
}

const RSVPFlyout: FC<RSVPFlyoutProps> = ({ openWithURLParam = 'rsvp', renderReference, token }) => {
  const [didValuesChange, setDidValuesChange] = useState<boolean>(false);
  const [shouldFetchRSVP, setShouldFetchRSVP] = useState<boolean>(false);
  const [shouldRenderDismissWarning, setShouldRenderDismissWarning] = useState<boolean>(false);

  const renderContent = useCallback(
    (contentProps: FlyoutContentComponentProps): JSX.Element => (
      <RSVPFlyoutComponent
        {...contentProps}
        defaultSelectedGuestId={token.guestId}
        onValuesChange={setDidValuesChange}
        setShouldRenderDismissWarning={setShouldRenderDismissWarning}
        shouldFetchRSVP={shouldFetchRSVP}
        shouldRenderDismissWarning={shouldRenderDismissWarning}
      />
    ),
    [shouldFetchRSVP, shouldRenderDismissWarning, token],
  );

  const renderDefaultReference = useCallback(
    (referenceProps: FlyoutReferenceComponentProps): JSX.Element => (
      <Button {...referenceProps}>
        <MarkEmailReadIconSVG />
        <span className={styles.buttonText}>{Translate.t('components.flyouts.rsvp.buttons.rsvp')}</span>
      </Button>
    ),
    [],
  );

  const onAttemptToDismiss = useCallback((): boolean => {
    setShouldRenderDismissWarning(didValuesChange);
    return !didValuesChange;
  }, [didValuesChange]);

  const onToggleFlyout = useCallback((): void => {
    setShouldFetchRSVP(true);
  }, []);

  return (
    <Flyout
      onAttemptToDismiss={onAttemptToDismiss}
      onToggleFlyout={onToggleFlyout}
      openWithURLParam={openWithURLParam}
      renderContent={renderContent}
      renderReference={renderReference || renderDefaultReference}
    />
  );
};

export default RSVPFlyout;
