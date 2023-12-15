'use client';

import CheckIconSVG from 'assets/icons/check.svg';
import CopyIconSVG from 'assets/icons/copy.svg';
import ExpandLessIconSVG from 'assets/icons/expand-less.svg';
import GroupIconSVG from 'assets/icons/group.svg';
import classNames from 'classnames';
import Translate from 'client/translate';
import Tooltip from 'components/tooltip';
import cloneDeep from 'lodash.clonedeep';
import { FC, Fragment, useCallback, useMemo, useState } from 'react';
import { MDBGuestData } from 'server/models/guest';
import { MDBResponseData } from 'server/models/response';

import styles from './component.module.css';

export interface GuestListComponentProps {
  guestList: { guests: MDBGuestData[]; id: string; responses: MDBResponseData[] }[];
}

const GuestListComponent: FC<GuestListComponentProps> = ({ guestList }) => {
  const [collapsedGuestGroups, setCollapsedGuestGroups] = useState<Set<string>>(new Set());
  const [copiedObjectIds, setCopiedObjectIds] = useState<Set<string>>(new Set());

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

  const sortedGuestList = useMemo<{ guests: MDBGuestData[]; id: string; responses: MDBResponseData[] }[]>(() => {
    const guestListClone = cloneDeep(guestList);
    guestListClone.sort(sortByKey('id'));
    for (const guestGroup of guestListClone) {
      guestGroup.guests.sort(sortByKey('name'));
    }
    return guestListClone;
  }, [guestList, sortByKey]);

  const copyObjectId = (objectId: string): void => {
    navigator.clipboard.writeText(objectId);
    setCopiedObjectIds((prevState: Set<string>): Set<string> => {
      const nextState = new Set(prevState);
      nextState.add(objectId);
      return nextState;
    });
    setTimeout(() => {
      setCopiedObjectIds((prevState: Set<string>): Set<string> => {
        const nextState = new Set(prevState);
        nextState.delete(objectId);
        return nextState;
      });
    }, 2000);
  };

  const renderGuestGroupHeader = useCallback(
    (guestGroup: { guests: MDBGuestData[]; id: string; responses: MDBResponseData[] }): JSX.Element => {
      const collapseGuestGroup = (): void => {
        setCollapsedGuestGroups((prevState: Set<string>): Set<string> => {
          const nextState = new Set(prevState);
          if (nextState.has(guestGroup.id)) {
            nextState.delete(guestGroup.id);
          } else {
            nextState.add(guestGroup.id);
          }
          return nextState;
        });
      };

      return (
        <tbody>
          <tr
            className={classNames(
              styles.guestGroupHeader,
              collapsedGuestGroups.has(guestGroup.id) && styles.guestGroupHeaderCollapsed,
            )}
            onClick={collapseGuestGroup}
          >
            <td colSpan={4}>
              <div className={styles.guestGroupHeaderText}>
                <GroupIconSVG className={styles.guestGroupIcon} />
                {guestGroup.id ? (
                  <Fragment>
                    {Translate.t('components.guest-list.guest-groups.name', { name: guestGroup.id.substr(-7) })}
                    {copiedObjectIds.has(guestGroup.id) ? (
                      <div>
                        <CheckIconSVG className={styles.guestGroupIdCopiedIcon} />
                      </div>
                    ) : (
                      <Tooltip
                        placement="right-end"
                        renderContent={() => Translate.t('components.guest-list.guest-table.tooltips.copy')}
                      >
                        <div>
                          <CopyIconSVG
                            className={styles.guestGroupIdCopyIcon}
                            onClick={(event): void => {
                              event.stopPropagation();
                              copyObjectId(guestGroup.id);
                            }}
                          />
                        </div>
                      </Tooltip>
                    )}
                  </Fragment>
                ) : (
                  Translate.t('components.guest-list.guest-groups.individual')
                )}
                <div className={styles.spacer} />
                <ExpandLessIconSVG className={styles.guestGroupExpandIcon} />
              </div>
            </td>
          </tr>
        </tbody>
      );
    },
    [collapsedGuestGroups, copiedObjectIds],
  );

  const renderCollapsibleCell = useCallback(
    (children?: JSX.Element | string): JSX.Element => (
      <td>
        <div>
          <div className={styles.guestGroupGuestsCell}>{children}</div>
        </div>
      </td>
    ),
    [],
  );

  const renderGuestGroupMember = useCallback(
    (
      guest: MDBGuestData,
      guestGroup: { guests: MDBGuestData[]; id: string; responses: MDBResponseData[] },
    ): JSX.Element => {
      const hasRSVP: boolean = guestGroup.responses.some((response: MDBResponseData): boolean => {
        return response.guest === guest.id;
      });

      return (
        <tr key={guest.id}>
          {renderCollapsibleCell(
            <Fragment>
              {guest.id.substr(-7)}
              {copiedObjectIds.has(guest.id) ? (
                <div>
                  <CheckIconSVG />
                </div>
              ) : (
                <Tooltip
                  placement="right-end"
                  renderContent={() => Translate.t('components.guest-list.guest-table.tooltips.copy')}
                >
                  <div>
                    <CopyIconSVG
                      className={styles.guestIdCopyIcon}
                      onClick={(): void => {
                        copyObjectId(guest.id);
                      }}
                    />
                  </div>
                </Tooltip>
              )}
            </Fragment>,
          )}
          {renderCollapsibleCell(guest.name)}
          {renderCollapsibleCell(guest.email)}
          {renderCollapsibleCell(
            hasRSVP
              ? Translate.t('components.guest-list.guest-table.rows.rsvp.yes')
              : Translate.t('components.guest-list.guest-table.rows.rsvp.no'),
          )}
        </tr>
      );
    },
    [copiedObjectIds, renderCollapsibleCell],
  );

  const renderGuestGroupMembers = useCallback(
    (guestGroup: { guests: MDBGuestData[]; id: string; responses: MDBResponseData[] }): JSX.Element => {
      if (guestGroup.guests.length === 0) {
        return <Fragment />;
      }
      return (
        <tbody
          className={classNames(
            styles.guestGroupGuests,
            collapsedGuestGroups.has(guestGroup.id) && styles.guestGroupGuestsCollapsed,
          )}
        >
          {guestGroup.guests.map((guest: MDBGuestData): JSX.Element => renderGuestGroupMember(guest, guestGroup))}
        </tbody>
      );
    },
    [collapsedGuestGroups, renderGuestGroupMember],
  );

  const renderGuestGroup = useCallback(
    (guestGroup: { guests: MDBGuestData[]; id: string; responses: MDBResponseData[] }, index: number): JSX.Element => (
      <Fragment key={guestGroup.id || index}>
        {renderGuestGroupHeader(guestGroup)}
        {renderGuestGroupMembers(guestGroup)}
      </Fragment>
    ),
    [renderGuestGroupHeader, renderGuestGroupMembers],
  );

  return (
    <div className={styles.guestList}>
      <table className={styles.guestTable}>
        <thead>
          <tr>
            <th>{Translate.t('components.guest-list.guest-table.columns.id')}</th>
            <th>{Translate.t('components.guest-list.guest-table.columns.name')}</th>
            <th>{Translate.t('components.guest-list.guest-table.columns.email')}</th>
            <th>{Translate.t('components.guest-list.guest-table.columns.rsvp')}</th>
          </tr>
        </thead>
        {sortedGuestList.map(renderGuestGroup)}
      </table>
    </div>
  );
};

export default GuestListComponent;
