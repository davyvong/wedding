'use client';

import CheckIconSVG from 'assets/icons/check.svg';
import CollapseAllIconSVG from 'assets/icons/collapse-all.svg';
import CopyIconSVG from 'assets/icons/copy.svg';
import ExpandAllIconSVG from 'assets/icons/expand-all.svg';
import ExpandLessIconSVG from 'assets/icons/expand-less.svg';
import GroupIconSVG from 'assets/icons/group.svg';
import MarkEmailReadIconSVG from 'assets/icons/mark-email-read.svg';
import classNames from 'classnames';
import Translate from 'client/translate';
import { FlyoutReferenceComponentProps } from 'components/flyout/component';
import RSVPFlyout from 'components/flyouts/rsvp';
import Tooltip from 'components/tooltip';
import cloneDeep from 'lodash.clonedeep';
import { FC, Fragment, useCallback, useMemo, useState } from 'react';
import { GuestData } from 'server/models/guest';
import { ResponseData } from 'server/models/response';
import { sortByKey } from 'utils/sort';

import styles from './component.module.css';

export interface GuestListComponentProps {
  guestList: { guests: GuestData[]; id: string; responses: ResponseData[] }[];
}

const GuestListComponent: FC<GuestListComponentProps> = ({ guestList }) => {
  const [clickedIconButtons, setClickedIconButtons] = useState<Set<string>>(new Set());
  const [collapsedGuestGroups, setCollapsedGuestGroups] = useState<Set<string>>(new Set());

  const sortedGuestList = useMemo<{ guests: GuestData[]; id: string; responses: ResponseData[] }[]>(() => {
    const guestListClone = cloneDeep(guestList);
    guestListClone.sort(sortByKey('id'));
    for (const guestGroup of guestListClone) {
      guestGroup.guests.sort(sortByKey('name'));
    }
    return guestListClone;
  }, [guestList]);

  const areAllGuestGroupsExpanded = useMemo<boolean>(() => {
    return !guestList.some((guestGroup: { guests: GuestData[]; id: string; responses: ResponseData[] }): boolean => {
      return collapsedGuestGroups.has(guestGroup.id);
    });
  }, [collapsedGuestGroups, guestList]);

  const collapseAllGuestGroups = useCallback((): void => {
    setCollapsedGuestGroups((prevState: Set<string>): Set<string> => {
      const guestGroupIds = guestList.map(
        (guestGroup: { guests: GuestData[]; id: string; responses: ResponseData[] }): string => {
          return guestGroup.id;
        },
      );
      return new Set([...prevState, ...guestGroupIds]);
    });
  }, [guestList]);

  const onClickIconButton = useCallback((objectId: string): void => {
    setClickedIconButtons((prevState: Set<string>): Set<string> => {
      const nextState = new Set(prevState);
      nextState.add(objectId);
      return nextState;
    });
    setTimeout(() => {
      setClickedIconButtons((prevState: Set<string>): Set<string> => {
        const nextState = new Set(prevState);
        nextState.delete(objectId);
        return nextState;
      });
    }, 2000);
  }, []);

  const collapseGuestGroup = useCallback((guestGroupId: string): void => {
    setCollapsedGuestGroups((prevState: Set<string>): Set<string> => {
      const nextState = new Set(prevState);
      if (nextState.has(guestGroupId)) {
        nextState.delete(guestGroupId);
      } else {
        nextState.add(guestGroupId);
      }
      return nextState;
    });
  }, []);

  const renderGuestGroupHeader = useCallback(
    (guestGroup: { guests: GuestData[]; id: string; responses: ResponseData[] }): JSX.Element => (
      <tbody>
        <tr
          className={classNames(
            styles.guestGroupHeader,
            collapsedGuestGroups.has(guestGroup.id) && styles.guestGroupHeaderCollapsed,
          )}
          onClick={(): void => collapseGuestGroup(guestGroup.id)}
        >
          <td colSpan={100}>
            <div className={styles.guestGroupId}>
              <GroupIconSVG className={styles.guestGroupIcon} />
              {guestGroup.id ? (
                <Fragment>
                  {guestGroup.id.substr(-7)}
                  {clickedIconButtons.has('copiedGuestGroupId-' + guestGroup.id) ? (
                    <div>
                      <CheckIconSVG className={styles.copiedGuestGroupIdIcon} />
                    </div>
                  ) : (
                    <Tooltip
                      placement="right-middle"
                      renderContent={(): string => Translate.t('components.guest-list.tooltips.copy')}
                    >
                      <div className={classNames(styles.iconButton, styles.copyGuestGroupIdIcon)}>
                        <CopyIconSVG
                          onClick={(event): void => {
                            event.stopPropagation();
                            navigator.clipboard.writeText(guestGroup.id);
                            onClickIconButton('copiedGuestGroupId-' + guestGroup.id);
                          }}
                        />
                      </div>
                    </Tooltip>
                  )}
                </Fragment>
              ) : (
                Translate.t('components.guest-list.individuals')
              )}
              <div className={styles.spacer} />
              <Tooltip
                placement="left-middle"
                renderContent={(): string => {
                  return collapsedGuestGroups.has(guestGroup.id)
                    ? Translate.t('components.guest-list.tooltips.expand')
                    : Translate.t('components.guest-list.tooltips.collapse');
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
    ),
    [collapseGuestGroup, collapsedGuestGroups, clickedIconButtons, onClickIconButton],
  );

  const renderCollapsibleCell = useCallback(
    (children?: JSX.Element | string): JSX.Element => (
      <td>
        <div>
          <div className={styles.collapsibleCell}>{children}</div>
        </div>
      </td>
    ),
    [],
  );

  const renderGuest = useCallback(
    (guest: GuestData, guestGroup: { guests: GuestData[]; id: string; responses: ResponseData[] }): JSX.Element => {
      const guestResponse: ResponseData | undefined = guestGroup.responses.find(
        (response: ResponseData): boolean => response.guest === guest.id,
      );

      const renderGuestAttendance = (): JSX.Element | string => {
        if (!guestResponse) {
          return <Fragment />;
        }
        return guestResponse.attendance
          ? Translate.t('components.guest-list.rows.attendance.yes')
          : Translate.t('components.guest-list.rows.attendance.no');
      };

      return (
        <tr key={guest.id}>
          {renderCollapsibleCell(
            <Fragment>
              {guest.id.substr(-7)}
              {clickedIconButtons.has('copiedGuestId-' + guest.id) ? (
                <div>
                  <CheckIconSVG className={styles.copiedGuestIdIcon} />
                </div>
              ) : (
                <Tooltip
                  placement="right-middle"
                  renderContent={(): string => Translate.t('components.guest-list.tooltips.copy')}
                >
                  <div className={classNames(styles.iconButton, styles.copyGuestIdIcon)}>
                    <CopyIconSVG
                      onClick={(): void => {
                        navigator.clipboard.writeText(guest.id);
                        onClickIconButton('copiedGuestId-' + guest.id);
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
            guestResponse
              ? Translate.t('components.guest-list.rows.rsvp.yes')
              : Translate.t('components.guest-list.rows.rsvp.no'),
          )}
          {renderCollapsibleCell(renderGuestAttendance())}
          {renderCollapsibleCell(
            <Fragment>
              <div className={styles.spacer} />
              <RSVPFlyout
                openWithURLParam=""
                renderReference={(referenceProps: FlyoutReferenceComponentProps): JSX.Element => (
                  <div {...referenceProps}>
                    <Tooltip
                      placement="left-middle"
                      renderContent={(): string => Translate.t('components.guest-list.tooltips.view-rsvp')}
                    >
                      <div className={styles.iconButton}>
                        <MarkEmailReadIconSVG />
                      </div>
                    </Tooltip>
                  </div>
                )}
                token={{ guestId: guest.id }}
              />
            </Fragment>,
          )}
        </tr>
      );
    },
    [clickedIconButtons, onClickIconButton, renderCollapsibleCell],
  );

  const renderGuestGroup = useCallback(
    (guestGroup: { guests: GuestData[]; id: string; responses: ResponseData[] }): JSX.Element => {
      if (guestGroup.guests.length === 0) {
        return <Fragment />;
      }
      return (
        <tbody
          className={classNames(
            styles.guestGroup,
            collapsedGuestGroups.has(guestGroup.id) && styles.guestGroupCollapsed,
          )}
        >
          {guestGroup.guests.map((guest: GuestData): JSX.Element => renderGuest(guest, guestGroup))}
        </tbody>
      );
    },
    [collapsedGuestGroups, renderGuest],
  );

  const renderGuestGroupWithHeader = useCallback(
    (guestGroup: { guests: GuestData[]; id: string; responses: ResponseData[] }, index: number): JSX.Element => (
      <Fragment key={guestGroup.id || index}>
        {renderGuestGroupHeader(guestGroup)}
        {renderGuestGroup(guestGroup)}
      </Fragment>
    ),
    [renderGuestGroupHeader, renderGuestGroup],
  );

  return (
    <div className={styles.guestList}>
      <table className={styles.guestTable}>
        <thead>
          <tr>
            <th>{Translate.t('components.guest-list.columns.id')}</th>
            <th>{Translate.t('components.guest-list.columns.name')}</th>
            <th>{Translate.t('components.guest-list.columns.email')}</th>
            <th>{Translate.t('components.guest-list.columns.rsvp')}</th>
            <th>{Translate.t('components.guest-list.columns.attendance')}</th>
            <th>
              <div className={styles.guestTableActionHeader}>
                <Tooltip
                  placement="left-middle"
                  renderContent={(): string => {
                    return areAllGuestGroupsExpanded
                      ? Translate.t('components.guest-list.tooltips.collapse-all')
                      : Translate.t('components.guest-list.tooltips.expand-all');
                  }}
                >
                  <div className={styles.iconButton}>
                    {areAllGuestGroupsExpanded ? (
                      <CollapseAllIconSVG onClick={collapseAllGuestGroups} />
                    ) : (
                      <ExpandAllIconSVG onClick={(): void => setCollapsedGuestGroups(new Set())} />
                    )}
                  </div>
                </Tooltip>
              </div>
            </th>
          </tr>
        </thead>
        {sortedGuestList.map(renderGuestGroupWithHeader)}
      </table>
    </div>
  );
};

export default GuestListComponent;
