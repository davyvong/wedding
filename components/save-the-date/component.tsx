import Link from 'components/link';
import type { LinkComponentProps } from 'components/link/component';
import MDX from 'components/mdx';
import useTranslate from 'hooks/translate';
import { useCallback, useMemo } from 'react';
import type { FC } from 'react';

import styles from './component.module.css';

class CalendarLinks {
  static getGoogle(): string {
    const url = new URL('https://calendar.google.com/calendar/event');
    url.searchParams.set('action', 'TEMPLATE');
    url.searchParams.set('tmeid', 'MjBjc3ZpMXE4OXRsdjIwYzM2MzluaGc2MWEgZGF2eS52b25nQG0');
    url.searchParams.set('tmsrc', 'davy.vong@gmail.com');
    return url.href;
  }

  static getICS(): string {
    return '/davy-and-vivian-wedding.ics';
  }

  static getOutlook(): string {
    const url = new URL('https://outlook.live.com/calendar/0/deeplink/compose');
    url.searchParams.set('allday', 'true');
    url.searchParams.set('body', 'http://wedding.davyvong.com/');
    url.searchParams.set('enddt', '2023-06-23');
    url.searchParams.set(
      'location',
      'Willow Springs Winery, 5572 Bethesda Rd, Whitchurch-Stouffville, ON L4A 3A2, Canada',
    );
    url.searchParams.set('path', '/calendar/action/compose');
    url.searchParams.set('rru', 'addevent');
    url.searchParams.set('startdt', '2023-06-23');
    url.searchParams.set('subject', "Davy & Vivian's Wedding");
    return url.href;
  }
}

const SaveTheDateComponent: FC = () => {
  const t = useTranslate();

  const addToCalendarOptions = useMemo<LinkComponentProps[]>(
    () => [
      {
        alt: t('components.save-the-date.add-to-calendar.google'),
        href: CalendarLinks.getGoogle(),
        target: '_blank',
        text: t('components.save-the-date.add-to-calendar.google'),
      },
      {
        alt: t('components.save-the-date.add-to-calendar.outlook'),
        href: CalendarLinks.getOutlook(),
        target: '_blank',
        text: t('components.save-the-date.add-to-calendar.outlook'),
      },
      {
        alt: t('components.save-the-date.add-to-calendar.ics'),
        href: CalendarLinks.getICS(),
        text: t('components.save-the-date.add-to-calendar.ics'),
      },
    ],
    [t],
  );

  const renderLink = useCallback(link => <Link {...link} key={link.text} />, []);

  return (
    <MDX className={styles.container}>
      <h1>Save The Date</h1>
      <h3>Add to Calendar</h3>
      <div className={styles.calendarLinks}>{addToCalendarOptions.map(renderLink)}</div>
    </MDX>
  );
};

export default SaveTheDateComponent;
