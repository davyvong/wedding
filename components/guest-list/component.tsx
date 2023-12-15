'use client';

import CheckIconSVG from 'assets/icons/check.svg';
import CollapseAllIconSVG from 'assets/icons/collapse-all.svg';
import CopyIconSVG from 'assets/icons/copy.svg';
import ExpandAllIconSVG from 'assets/icons/expand-all.svg';
import ExpandLessIconSVG from 'assets/icons/expand-less.svg';
import GroupIconSVG from 'assets/icons/group.svg';
import PasskeyIconSVG from 'assets/icons/passkey.svg';
import classNames from 'classnames';
import Translate from 'client/translate';
import Tooltip from 'components/tooltip';
import cloneDeep from 'lodash.clonedeep';
import { usePathname, useRouter } from 'next/navigation';
import { FC, Fragment, useCallback, useMemo, useState } from 'react';
import { MDBGuestData } from 'server/models/guest';
import { MDBResponseData } from 'server/models/response';
import { sortByKey } from 'utils/sort';

import styles from './component.module.css';

export interface GuestListComponentProps {
  guestList: { guests: MDBGuestData[]; id: string; responses: MDBResponseData[] }[];
}

const GuestListComponent: FC<GuestListComponentProps> = ({ guestList }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [collapsedGuestGroups, setCollapsedGuestGroups] = useState<Set<string>>(new Set());
  const [copiedObjectIds, setCopiedObjectIds] = useState<Set<string>>(new Set());

  const sortedGuestList = useMemo<{ guests: MDBGuestData[]; id: string; responses: MDBResponseData[] }[]>(() => {
    const guestListClone = cloneDeep(guestList);
    guestListClone.sort(sortByKey('id'));
    for (const guestGroup of guestListClone) {
      guestGroup.guests.sort(sortByKey('name'));
    }
    return guestListClone;
  }, [guestList]);

  const areAllGuestGroupsExpanded = useMemo<boolean>(() => {
    return !guestList.some(
      (guestGroup: { guests: MDBGuestData[]; id: string; responses: MDBResponseData[] }): boolean => {
        return collapsedGuestGroups.has(guestGroup.id);
      },
    );
  }, [collapsedGuestGroups, guestList]);

  const collapseAllGuestGroups = useCallback((): void => {
    setCollapsedGuestGroups((prevState: Set<string>): Set<string> => {
      const guestGroupIds = guestList.map(
        (guestGroup: { guests: MDBGuestData[]; id: string; responses: MDBResponseData[] }): string => {
          return guestGroup.id;
        },
      );
      return new Set([...prevState, ...guestGroupIds]);
    });
  }, [guestList]);

  const copyObjectId = useCallback((objectId: string): void => {
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
  }, []);

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
            <td colSpan={5}>
              <div className={styles.guestGroupHeaderText}>
                <GroupIconSVG className={styles.guestGroupIcon} />
                {guestGroup.id ? (
                  <Fragment>
                    {guestGroup.id.substr(-7)}
                    {copiedObjectIds.has(guestGroup.id) ? (
                      <div>
                        <CheckIconSVG className={styles.guestGroupIdCopiedIcon} />
                      </div>
                    ) : (
                      <Tooltip
                        placement="right-middle"
                        renderContent={(): string => Translate.t('components.guest-list.guest-table.tooltips.copy')}
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
                <Tooltip
                  placement="left-middle"
                  renderContent={(): string => {
                    return collapsedGuestGroups.has(guestGroup.id)
                      ? Translate.t('components.guest-list.guest-table.tooltips.expand')
                      : Translate.t('components.guest-list.guest-table.tooltips.collapse');
                  }}
                >
                  <div>
                    <ExpandLessIconSVG className={styles.guestGroupExpandIcon} />
                  </div>
                </Tooltip>
              </div>
            </td>
          </tr>
        </tbody>
      );
    },
    [collapsedGuestGroups, copiedObjectIds, copyObjectId],
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
                  placement="right-middle"
                  renderContent={(): string => Translate.t('components.guest-list.guest-table.tooltips.copy')}
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
          {renderCollapsibleCell(
            <Fragment>
              <div className={styles.spacer} />
              <Tooltip
                placement="left-middle"
                renderContent={(): string => {
                  return Translate.t('components.guest-list.guest-table.tooltips.spoofAs', { name: guest.name });
                }}
              >
                <div>
                  <PasskeyIconSVG
                    className={styles.spoofAsIcon}
                    onClick={(): void => {
                      router.replace(pathname + '?spoofAs=' + guest.id, { scroll: false });
                    }}
                  />
                </div>
              </Tooltip>
            </Fragment>,
          )}
        </tr>
      );
    },
    [copiedObjectIds, copyObjectId, pathname, renderCollapsibleCell, router],
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
            <th>
              <div className={styles.guestTableActionHeader}>
                <Tooltip
                  placement="left-middle"
                  renderContent={(): string => {
                    return areAllGuestGroupsExpanded
                      ? Translate.t('components.guest-list.guest-table.tooltips.collapse-all')
                      : Translate.t('components.guest-list.guest-table.tooltips.expand-all');
                  }}
                >
                  <div>
                    {areAllGuestGroupsExpanded ? (
                      <CollapseAllIconSVG className={styles.collapseAllIcon} onClick={collapseAllGuestGroups} />
                    ) : (
                      <ExpandAllIconSVG
                        className={styles.expandAllIcon}
                        onClick={(): void => {
                          setCollapsedGuestGroups(new Set());
                        }}
                      />
                    )}
                  </div>
                </Tooltip>
              </div>
            </th>
          </tr>
        </thead>
        {sortedGuestList.map(renderGuestGroup)}
      </table>
    </div>
  );
};

export default GuestListComponent;
