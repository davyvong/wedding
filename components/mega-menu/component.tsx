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
import Link from 'next/link';
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

interface MegaMenuBaseItem {
  description: string;
  icon: JSX.Element;
  title: string;
}

interface MegaMenuButtonItem extends MegaMenuBaseItem {
  onClick: () => void;
  type: 'button';
}

interface MegaMenuLinkItem extends MegaMenuBaseItem {
  href: string;
  type: 'link';
}

type MegaMenuItem = MegaMenuButtonItem | MegaMenuLinkItem;

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

  const menuItems = useMemo<Array<MegaMenuItem>>(() => {
    const items: Array<MegaMenuItem> = [];
    if (token) {
      if (token.isAdmin) {
        items.push({
          description: Translate.t('components.mega-menu.menu-items.guest-list.description'),
          href: '/guests',
          icon: <QueueMusicIconSVG />,
          title: Translate.t('components.mega-menu.menu-items.guest-list.title'),
          type: 'link',
        });
      }
      items.push(
        {
          description: Translate.t('components.mega-menu.menu-items.rsvp.description'),
          icon: <MarkEmailReadIconSVG />,
          onClick: (): void => {
            openFlyout('rsvp');
          },
          title: Translate.t('components.mega-menu.menu-items.rsvp.title'),
          type: 'button',
        },
        {
          description: Translate.t('components.mega-menu.menu-items.songs.description'),
          icon: <QueueMusicIconSVG />,
          onClick: (): void => {
            openFlyout('songs');
          },
          title: Translate.t('components.mega-menu.menu-items.songs.title'),
          type: 'button',
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
        type: 'button',
      });
    }
    items.push({
      description: Translate.t('components.mega-menu.menu-items.faq.description'),
      icon: <HelpIconSVG />,
      onClick: (): void => {
        setIsOpen(false);
        if (document.getElementById('faq')) {
          navigateToFAQ();
        } else {
          router.push('/?scrollTo=faq');
        }
      },
      title: Translate.t('components.mega-menu.menu-items.faq.title'),
      type: 'button',
    });
    if (token) {
      items.push({
        description: Translate.t('components.mega-menu.menu-items.sign-out.description'),
        icon: <UnsubscribeIconSVG />,
        onClick: (): void => {
          setIsOpen(false);
          router.push('/sign-out?redirect=' + encodeURIComponent('/?open=invitation'));
          router.refresh();
        },
        title: Translate.t('components.mega-menu.menu-items.sign-out.title'),
        type: 'button',
      });
    }
    return items;
  }, [openFlyout, router, token]);

  const renderMenuItem = useCallback((item: MegaMenuItem, index: number): JSX.Element => {
    if (item.type === 'link') {
      return (
        <Link className={styles.menuItem} href={item.href} key={index} role="menuitem" tabIndex={0}>
          <div className={styles.menuItemIcon}>{item.icon}</div>
          <div className={styles.menuItemContent}>
            <div>{item.title}</div>
            <div className={styles.menuItemDescription}>{item.description}</div>
          </div>
        </Link>
      );
    }
    return (
      <button className={styles.menuItem} key={index} onClick={item.onClick} role="menuitem" tabIndex={0}>
        <div className={styles.menuItemIcon}>{item.icon}</div>
        <div className={styles.menuItemContent}>
          <div>{item.title}</div>
          <div className={styles.menuItemDescription}>{item.description}</div>
        </div>
      </button>
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
