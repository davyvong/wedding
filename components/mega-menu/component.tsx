'use client';

import {
  FloatingFocusManager,
  FloatingOverlay,
  autoUpdate,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
  useTransitionStyles,
} from '@floating-ui/react';
import MarkEmailReadIconSVG from 'assets/icons/mark-email-read.svg';
import MarkEmailUnreadIconSVG from 'assets/icons/mark-email-unread.svg';
import QueueMusicIconSVG from 'assets/icons/queue-music.svg';
import classNames from 'classnames';
import Translate from 'client/translate';
import flyoutStyles from 'components/flyout/component.module.css';
import InvitationFlyout from 'components/flyouts/invitation';
import RSVPFlyout from 'components/flyouts/rsvp';
import SongsFlyout from 'components/flyouts/songs';
import { FC, Fragment, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { GuestTokenPayload } from 'server/authenticator';

import styles from './component.module.css';

interface MegaMenuProps {
  token?: GuestTokenPayload;
}

const MegaMenu: FC<MegaMenuProps> = ({ token }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { context, floatingStyles, refs } = useFloating({
    middleware: [offset(8), shift({ padding: 24 })],
    onOpenChange: setIsOpen,
    open: isOpen,
    placement: 'bottom',
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);
  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: 300,
  });
  const { styles: overlayStyles } = useTransitionStyles(context, {
    duration: 300,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const openFlyout = useCallback((name: 'invitation' | 'rsvp' | 'songs'): void => {
    setIsOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.set('open', name);
    window.history.pushState({ path: url.href }, '', url.href);
  }, []);

  return (
    <Fragment>
      <button
        {...getReferenceProps()}
        className={classNames(styles.toggleButton, isOpen && styles.toggleButtonClose)}
        ref={refs.setReference}
      >
        <span className={styles.toggleButtonLine1} />
        <span className={styles.toggleButtonLine2} />
        <span className={styles.toggleButtonLine3} />
      </button>
      {isMounted &&
        createPortal(
          <Fragment>
            <FloatingOverlay className={flyoutStyles.overlay} lockScroll>
              <div className={flyoutStyles.overlayBlur} style={overlayStyles} />
            </FloatingOverlay>
            <FloatingFocusManager context={context}>
              <div
                {...getFloatingProps()}
                className={styles.megaMenu}
                ref={refs.setFloating}
                style={{ ...floatingStyles, ...transitionStyles }}
              >
                {token ? (
                  <Fragment>
                    <div className={styles.menuItem} onClick={(): void => openFlyout('rsvp')}>
                      <div className={styles.menuItemIcon}>
                        <MarkEmailReadIconSVG />
                      </div>
                      <div className={styles.menuItemContent}>
                        <div>{Translate.t('components.flyouts.rsvp.buttons.rsvp')}</div>
                        <div className={styles.menuItemDescription}>
                          {Translate.t('components.flyouts.rsvp.buttons.rsvp')}
                        </div>
                      </div>
                    </div>
                    <div className={styles.menuItem} onClick={(): void => openFlyout('songs')}>
                      <div className={styles.menuItemIcon}>
                        <QueueMusicIconSVG />
                      </div>
                      <div className={styles.menuItemContent}>
                        <div>{Translate.t('components.flyouts.songs.song-requests')}</div>
                        <div className={styles.menuItemDescription}>
                          {Translate.t('components.flyouts.songs.song-requests')}
                        </div>
                      </div>
                    </div>
                  </Fragment>
                ) : (
                  <div className={styles.menuItem} onClick={(): void => openFlyout('invitation')}>
                    <div className={styles.menuItemIcon}>
                      <MarkEmailUnreadIconSVG />
                    </div>
                    <div className={styles.menuItemContent}>
                      <div>{Translate.t('components.flyouts.invitation.buttons.invitation')}</div>
                      <div className={styles.menuItemDescription}>
                        {Translate.t('components.flyouts.invitation.buttons.invitation')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </FloatingFocusManager>
          </Fragment>,
          document.body,
        )}
      {token ? (
        <Fragment>
          <RSVPFlyout defaultSelectedGuestId={token.guestId} renderReference={() => <Fragment />} />
          <SongsFlyout renderReference={() => <Fragment />} />
        </Fragment>
      ) : (
        <InvitationFlyout renderReference={() => <Fragment />} />
      )}
    </Fragment>
  );
};

export default MegaMenu;
