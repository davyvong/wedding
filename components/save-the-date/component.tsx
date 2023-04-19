import Link from 'components/link';
import type { LinkComponentProps } from 'components/link/component';
import MDX from 'components/mdx';
import useTranslate from 'hooks/translate';
import { useCallback, useMemo } from 'react';
import type { FC } from 'react';

import CalendarLinks from './calendar-links';
import styles from './component.module.css';

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
