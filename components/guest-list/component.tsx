'use client';

import CheckIconSVG from 'assets/icons/check.svg';
import CopyIconSVG from 'assets/icons/copy.svg';
import ExpandLessIconSVG from 'assets/icons/expand-less.svg';
import GroupIconSVG from 'assets/icons/group.svg';
import classNames from 'classnames';
import Translate from 'client/translate';
import cloneDeep from 'lodash.clonedeep';
import { FC, Fragment, useCallback, useMemo, useState } from 'react';
import { MDBGuestData } from 'server/models/guest';

import styles from './component.module.css';

export interface GuestListComponentProps {
  guestGroups: { guests: MDBGuestData[]; id?: string }[];
}

const GuestListComponent: FC<GuestListComponentProps> = ({ guestGroups }) => {
  const [collapsedGuestGroups, setCollapsedGuestGroups] = useState<Set<string>>(new Set());
  const [copiedGuestId, setCopiedGuestId] = useState<Set<string>>(new Set());

  const sortByKey = useCallback(
    (key: string) =>
      (a, b): number => {
        if (!a[key]) {
          return 1;
        }
        if (!b[key]) {
          return -1;
        }
        if (a[key] > b[key]) {
          return 1;
        }
        if (a[key] < b[key]) {
          return -1;
        }
        return 0;
      },
    [],
  );

  const sortedGuestGroups = useMemo(() => {
    const guestGroupClone = cloneDeep(guestGroups);
    guestGroupClone.sort(sortByKey('id'));
    for (const guestGroup of guestGroupClone) {
      guestGroup.guests.sort(sortByKey('name'));
    }
    return guestGroupClone;
  }, [guestGroups, sortByKey]);

  const renderGuestGroup = useCallback(
    (guestGroup, index: number): JSX.Element => (
      <Fragment key={guestGroup.id || index}>
        <tbody>
          <tr
            className={classNames(
              styles.guestGroupHeader,
              collapsedGuestGroups.has(guestGroup.id) && styles.guestGroupHeaderCollapsed,
            )}
            onClick={(): void => {
              setCollapsedGuestGroups((prevState: Set<string>): Set<string> => {
                const nextState = new Set(prevState);
                if (nextState.has(guestGroup.id)) {
                  nextState.delete(guestGroup.id);
                } else {
                  nextState.add(guestGroup.id);
                }
                return nextState;
              });
            }}
          >
            <td colSpan={3}>
              <div className={styles.guestGroupHeaderText}>
                <GroupIconSVG className={styles.guestGroupIcon} />
                {guestGroup.id
                  ? Translate.t('components.guest-list.guest-groups.name', { name: guestGroup.id })
                  : Translate.t('components.guest-list.guest-groups.individual')}
                <div className={styles.spacer} />
                <ExpandLessIconSVG className={styles.guestGroupExpandIcon} />
              </div>
            </td>
          </tr>
        </tbody>
        {guestGroup.guests.length > 0 && (
          <tbody
            className={classNames(
              styles.guestGroupGuests,
              collapsedGuestGroups.has(guestGroup.id) && styles.guestGroupGuestsCollapsed,
            )}
          >
            {guestGroup.guests.map(guest => (
              <tr key={guest.id}>
                <td>
                  <div>
                    <div className={styles.guestGroupGuestsCell}>
                      {guest.id}
                      {copiedGuestId.has(guest.id) ? (
                        <CheckIconSVG />
                      ) : (
                        <CopyIconSVG
                          className={styles.guestIdCopyIcon}
                          onClick={(): void => {
                            navigator.clipboard.writeText(guest.id);
                            setCopiedGuestId((prevState: Set<string>): Set<string> => {
                              const nextState = new Set(prevState);
                              nextState.add(guest.id);
                              return nextState;
                            });
                            setTimeout(() => {
                              setCopiedGuestId((prevState: Set<string>): Set<string> => {
                                const nextState = new Set(prevState);
                                nextState.delete(guest.id);
                                return nextState;
                              });
                            }, 2000);
                          }}
                        />
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <div>
                    <div className={styles.guestGroupGuestsCell}>{guest.name}</div>
                  </div>
                </td>
                <td>
                  <div>
                    <div className={styles.guestGroupGuestsCell}>{guest.email}</div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        )}
      </Fragment>
    ),
    [collapsedGuestGroups, copiedGuestId],
  );

  return (
    <div className={styles.guestList}>
      <table className={styles.guestTable}>
        <thead>
          <tr>
            <th>{Translate.t('components.guest-list.guest-table.columns.id')}</th>
            <th>{Translate.t('components.guest-list.guest-table.columns.name')}</th>
            <th>{Translate.t('components.guest-list.guest-table.columns.email')}</th>
          </tr>
        </thead>
        {sortedGuestGroups.map(renderGuestGroup)}
      </table>
    </div>
  );
};

export default GuestListComponent;
