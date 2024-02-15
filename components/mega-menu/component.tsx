'use client';

import {
  FloatingFocusManager,
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
import HelpIconSVG from 'assets/icons/help.svg';
import MarkEmailReadIconSVG from 'assets/icons/mark-email-read.svg';
import MarkEmailUnreadIconSVG from 'assets/icons/mark-email-unread.svg';
import QueueMusicIconSVG from 'assets/icons/queue-music.svg';
import UnsubscribeIconSVG from 'assets/icons/unsubscribe.svg';
import classNames from 'classnames';
import Translate from 'client/translate';
import InvitationFlyout from 'components/flyouts/invitation';
import RSVPFlyout from 'components/flyouts/rsvp';
import SongsFlyout from 'components/flyouts/songs';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useRouter } from 'next/navigation';
import { FC, Fragment, useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { VerifiedGuestTokenPayload } from 'server/authenticator';
import { getStyleProperty } from 'utils/styles';

import styles from './component.module.css';

export const navigateToFAQ = (): void => {
  const pageSideSpacing = parseInt(getStyleProperty('--page-side-spacing').replace('rem', '')) * 16;
  const navigationBarHeight = parseInt(getStyleProperty('--navigation-bar-height').replace('px', ''));
  window.locomotiveScroll?.scrollTo('#faq', {
    callback: () => ScrollTrigger.update(),
    offset: pageSideSpacing - navigationBarHeight - 32,
  });
  ScrollTrigger.update();
};

interface MegaMenuProps {
  token?: VerifiedGuestTokenPayload;
}

interface MegaMenuItem {
  description: string;
  icon: JSX.Element;
  onClick: () => void;
  title: string;
}

const MegaMenu: FC<MegaMenuProps> = ({ token }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { context, floatingStyles, refs } = useFloating({
    middleware: [offset(16), shift({ padding: 24 })],
    onOpenChange: setIsOpen,
    open: isOpen,
    placement: 'bottom-end',
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'menu' });
  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: 300,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const openFlyout = useCallback((name: 'invitation' | 'rsvp' | 'songs'): void => {
    setIsOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.set('open', name);
    window.history.pushState({ path: url.href }, '', url.href);
  }, []);

  const menuItems = useMemo<MegaMenuItem[]>(() => {
    const items: MegaMenuItem[] = [];
    if (token) {
      items.push(
        {
          description: Translate.t('components.mega-menu.menu-items.rsvp.description'),
          icon: <MarkEmailReadIconSVG />,
          onClick: (): void => {
            openFlyout('rsvp');
          },
          title: Translate.t('components.mega-menu.menu-items.rsvp.title'),
        },
        {
          description: Translate.t('components.mega-menu.menu-items.songs.description'),
          icon: <QueueMusicIconSVG />,
          onClick: (): void => {
            openFlyout('songs');
          },
          title: Translate.t('components.mega-menu.menu-items.songs.title'),
        },
      );
    } else {
      items.push({
        description: Translate.t('components.mega-menu.menu-items.invitation.description'),
        icon: <MarkEmailUnreadIconSVG />,
        onClick: (): void => {
          openFlyout('invitation');
        },
        title: Translate.t('components.mega-menu.menu-items.invitation.title'),
      });
    }
    items.push({
      description: Translate.t('components.mega-menu.menu-items.faq.description'),
      icon: <HelpIconSVG />,
      onClick: (): void => {
        if (document.getElementById('faq')) {
          navigateToFAQ();
        } else {
          router.push('/?scrollTo=faq');
        }
        setIsOpen(false);
      },
      title: Translate.t('components.mega-menu.menu-items.faq.title'),
    });
    if (token) {
      items.push({
        description: Translate.t('components.mega-menu.menu-items.sign-out.description'),
        icon: <UnsubscribeIconSVG />,
        onClick: (): void => {
          router.push('/sign-out?redirect=' + encodeURIComponent('/?open=invitation'));
          router.refresh();
          setIsOpen(false);
        },
        title: Translate.t('components.mega-menu.menu-items.sign-out.title'),
      });
    }
    return items;
  }, [openFlyout, router, token]);

  const renderMenuItem = useCallback((item: MegaMenuItem, index: number): JSX.Element => {
    const onKeyDown = (event): boolean => {
      if (event.keyCode === 13) {
        event.stopPropagation();
        item.onClick();
        return false;
      }
      return true;
    };
    return (
      <div
        className={styles.menuItem}
        key={index}
        onClick={item.onClick}
        onKeyDown={onKeyDown}
        role="menuitem"
        tabIndex={0}
      >
        <div className={styles.menuItemIcon}>{item.icon}</div>
        <div className={styles.menuItemContent}>
          <div>{item.title}</div>
          {<div className={styles.menuItemDescription}>{item.description}</div>}
        </div>
      </div>
    );
  }, []);

  return (
    <Fragment>
      <button {...getReferenceProps()} aria-controls="menu" className={styles.toggleButton} ref={refs.setReference}>
        <div className={classNames(styles.toggleButtonOpen, isOpen && styles.toggleButtonClose)}>
          <span className={styles.toggleButtonLine1} />
          <span className={styles.toggleButtonLine2} />
          <span className={styles.toggleButtonLine3} />
        </div>
      </button>
      {isMounted &&
        createPortal(
          <FloatingFocusManager context={context}>
            <div
              {...getFloatingProps()}
              role="menu"
              className={styles.megaMenu}
              ref={refs.setFloating}
              style={{ ...floatingStyles, ...transitionStyles }}
            >
              {menuItems.map(renderMenuItem)}
            </div>
          </FloatingFocusManager>,
          document.body,
        )}
      <InvitationFlyout renderReference={() => <Fragment />} />
      {token && (
        <Fragment>
          <RSVPFlyout defaultSelectedGuestId={token.guestId} renderReference={() => <Fragment />} />
          <SongsFlyout renderReference={() => <Fragment />} />
        </Fragment>
      )}
    </Fragment>
  );
};

export default MegaMenu;
