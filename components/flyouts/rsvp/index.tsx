'use client';

import Flyout from 'components/flyout';
import { FlyoutContentComponentProps, FlyoutReferenceComponentProps } from 'components/flyout/component';
import { FC, useCallback, useState } from 'react';

import RSVPFlyoutComponent from './component';

interface RSVPFlyoutProps {
  defaultSelectedGuestId: string;
  openWithURLParam?: string;
  renderReference: (referenceProps: FlyoutReferenceComponentProps) => JSX.Element;
}

const RSVPFlyout: FC<RSVPFlyoutProps> = ({ defaultSelectedGuestId, openWithURLParam = 'rsvp', renderReference }) => {
  const [didValuesChange, setDidValuesChange] = useState<boolean>(false);
  const [shouldFetchRSVP, setShouldFetchRSVP] = useState<boolean>(false);
  const [shouldRenderDismissWarning, setShouldRenderDismissWarning] = useState<boolean>(false);

  const renderContent = useCallback(
    (contentProps: FlyoutContentComponentProps): JSX.Element => (
      <RSVPFlyoutComponent
        {...contentProps}
        defaultSelectedGuestId={defaultSelectedGuestId}
        onValuesChange={setDidValuesChange}
        setShouldRenderDismissWarning={setShouldRenderDismissWarning}
        shouldFetchRSVP={shouldFetchRSVP}
        shouldRenderDismissWarning={shouldRenderDismissWarning}
      />
    ),
    [defaultSelectedGuestId, shouldFetchRSVP, shouldRenderDismissWarning],
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
      renderReference={renderReference}
    />
  );
};

export default RSVPFlyout;
