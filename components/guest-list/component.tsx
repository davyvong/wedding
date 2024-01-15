'use client';

import CheckIconSVG from 'assets/icons/check.svg';
import CopyIconSVG from 'assets/icons/copy.svg';
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
  guestList: { guests: Omit<GuestData, 'isAdmin'>[]; id: string; responses: ResponseData[] }[];
}

const GuestListComponent: FC<GuestListComponentProps> = ({ guestList }) => {
  const [clickedIconButtons, setClickedIconButtons] = useState<Set<string>>(new Set());

  const sortedGuestList = useMemo<{ guests: GuestData[]; id: string; responses: ResponseData[] }[]>(() => {
    const guestListClone = cloneDeep(guestList);
    guestListClone.sort(sortByKey('id'));
    for (const guestGroup of guestListClone) {
      guestGroup.guests.sort(sortByKey('name'));
    }
    return guestListClone;
  }, [guestList]);

  const onClickIconButton = useCallback((objectId: string): void => {
    setClickedIconButtons((prevState: Set<string>): Set<string> => {
      const nextState = new Set(prevState);
      nextState.add(objectId);
      return nextState;
    });
    setTimeout(() => {
      try {
        setClickedIconButtons((prevState: Set<string>): Set<string> => {
          const nextState = new Set(prevState);
          nextState.delete(objectId);
          return nextState;
        });
      } catch {
        //
      }
    }, 2000);
  }, []);

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
          <td>
            <div className={styles.guestIdCell}>
              {guest.id.substr(-7)}
              {clickedIconButtons.has('copiedGuestId-' + guest.id) ? (
                <div className={styles.iconButton}>
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
            </div>
          </td>
          <td>{guest.name}</td>
          <td>{guest.email}</td>
          <td>
            {guestResponse
              ? Translate.t('components.guest-list.rows.rsvp.yes')
              : Translate.t('components.guest-list.rows.rsvp.no')}
          </td>
          <td>{renderGuestAttendance()}</td>
          <td>
            <div className={styles.viewRSVPCell}>
              <RSVPFlyout
                defaultSelectedGuestId={guest.id}
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
              />
            </div>
          </td>
        </tr>
      );
    },
    [clickedIconButtons, onClickIconButton],
  );

  const renderGuestGroup = useCallback(
    (guestGroup: { guests: GuestData[]; id: string; responses: ResponseData[] }, index): JSX.Element => {
      if (guestGroup.guests.length === 0) {
        return <Fragment key={guestGroup.id || index} />;
      }
      return (
        <tbody className={styles.guestGroup} key={guestGroup.id || index}>
          <tr className={styles.guestGroupRow}>
            <td colSpan={6}>
              <div className={styles.guestGroupCell}>
                <GroupIconSVG />
                {guestGroup.id ? (
                  <Fragment>
                    <span>{guestGroup.id.substr(-7)}</span>
                    {clickedIconButtons.has('copiedGuestId-' + guestGroup.id) ? (
                      <div className={styles.iconButton}>
                        <CheckIconSVG className={styles.copiedGuestGroupIdIcon} />
                      </div>
                    ) : (
                      <Tooltip
                        placement="right-middle"
                        renderContent={(): string => Translate.t('components.guest-list.tooltips.copy')}
                      >
                        <div className={classNames(styles.iconButton, styles.copyGuestGroupIdIcon)}>
                          <CopyIconSVG
                            onClick={(): void => {
                              navigator.clipboard.writeText(guestGroup.id);
                              onClickIconButton('copiedGuestId-' + guestGroup.id);
                            }}
                          />
                        </div>
                      </Tooltip>
                    )}
                  </Fragment>
                ) : (
                  <span>{Translate.t('components.guest-list.individuals')}</span>
                )}
                <div className={styles.separatorLine} />
              </div>
            </td>
          </tr>
          {guestGroup.guests.map((guest: GuestData): JSX.Element => renderGuest(guest, guestGroup))}
        </tbody>
      );
    },
    [clickedIconButtons, onClickIconButton, renderGuest],
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
            <th colSpan={2}>{Translate.t('components.guest-list.columns.attendance')}</th>
          </tr>
        </thead>
        {sortedGuestList.map(renderGuestGroup)}
      </table>
    </div>
  );
};

export default GuestListComponent;
