'use client';

import CheckIconSVG from 'assets/icons/check.svg';
import classNames from 'classnames';
import { waitForElement } from 'client/browser';
import Translate from 'client/translate';
import Button from 'components/button';
import { FlyoutContentComponentProps } from 'components/flyout/component';
import flyoutStyles from 'components/flyout/component.module.css';
import AddressInput from 'components/form/address-input';
import Select from 'components/form/select';
import TextInput from 'components/form/text-input';
import Textarea from 'components/form/textarea';
import LoadingHeart from 'components/loading-heart';
import Skeleton from 'components/skeleton';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FC } from 'react';
import { GuestData } from 'server/models/guest';
import { ResponseData } from 'server/models/response';
import useSWR from 'swr';
import { sortByKey } from 'utils/sort';
import { boolean, object, string } from 'yup';

import styles from './component.module.css';
import { EntreeOptions, attendanceOptions, entreeOptions } from './constants';

interface RSVPFlyoutComponentProps extends FlyoutContentComponentProps {
  defaultSelectedGuestId: string;
  onValuesChange?: (didValuesChange: boolean) => void;
  setShouldRenderDismissWarning?: (shouldRenderDismissWarning: boolean) => void;
  shouldFetchRSVP?: boolean;
  shouldRenderDismissWarning?: boolean;
}

export interface RSVPFlyoutComponentValues {
  attendance?: boolean;
  dietaryRestrictions: string;
  entree: string;
  mailingAddress: string;
  message: string;
}

interface RSVPFlyoutComponentErrors {
  attendance?: string;
  dietaryRestrictions?: string;
  entree?: string;
  mailingAddress?: string;
  message?: string;
}

const defaultValues: RSVPFlyoutComponentValues = {
  attendance: undefined,
  dietaryRestrictions: '',
  entree: '',
  mailingAddress: '',
  message: '',
};

const RSVPFlyoutComponent: FC<RSVPFlyoutComponentProps> = ({
  defaultSelectedGuestId,
  onValuesChange,
  setIsOpen,
  setShouldRenderDismissWarning,
  shouldFetchRSVP = true,
  shouldRenderDismissWarning = false,
}) => {
  const [selectedGuestId, setSelectedGuestId] = useState<string>(defaultSelectedGuestId);

  const fetchRSVP = useCallback(async (): Promise<{
    guests: GuestData[];
    responses: ResponseData[];
  } | null> => {
    const response = await fetch('/api/rsvp/' + selectedGuestId, {
      cache: 'no-store',
      method: 'GET',
    });
    const responseJson = await response.json();
    return {
      ...responseJson,
      guests: (responseJson.guests || []).sort(sortByKey('name')),
    };
  }, [selectedGuestId]);

  const { data, isLoading, mutate } = useSWR(
    (): null | string => (shouldFetchRSVP ? '/api/rsvp/' + selectedGuestId : null),
    fetchRSVP,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );

  const initialValues = useMemo<ResponseData | undefined>(() => {
    if (!data) {
      return undefined;
    }
    const response = data.responses.find((response: ResponseData): boolean => response.guest === selectedGuestId);
    if (!response) {
      return undefined;
    }
    return {
      ...response,
      dietaryRestrictions: response.dietaryRestrictions || '',
      entree: response.entree || '',
      mailingAddress: response.mailingAddress || '',
    };
  }, [data, selectedGuestId]);

  const [values, setValues] = useState<RSVPFlyoutComponentValues>({
    ...defaultValues,
    ...initialValues,
  });

  useEffect(() => {
    setValues({
      ...defaultValues,
      ...initialValues,
    });
  }, [initialValues, selectedGuestId]);

  const isEditMode = useMemo<boolean>((): boolean => !!initialValues, [initialValues]);

  const [errors, setErrors] = useState<RSVPFlyoutComponentErrors>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [switchToUser, setSwitchToUser] = useState<string | undefined>();

  const didValuesChange = useMemo<boolean>(() => {
    const unchangedValues: RSVPFlyoutComponentValues = {
      ...defaultValues,
      ...initialValues,
    };
    const unchangedKeys = Object.keys(unchangedValues);
    if (unchangedKeys.length !== Object.keys(values).length) {
      return true;
    }
    for (const key of unchangedKeys) {
      if (unchangedValues[key] !== values[key]) {
        return true;
      }
    }
    return false;
  }, [initialValues, values]);

  useEffect(() => {
    if (onValuesChange) {
      onValuesChange(didValuesChange);
    }
  }, [didValuesChange, onValuesChange]);

  const onAddressInputChange = useCallback((name: string, value: string): void => {
    setValues(
      (prevState: RSVPFlyoutComponentValues): RSVPFlyoutComponentValues => ({
        ...prevState,
        [name]: value,
      }),
    );
  }, []);

  const onInputChange = useCallback((event): void => {
    setValues(
      (prevState: RSVPFlyoutComponentValues): RSVPFlyoutComponentValues => ({
        ...prevState,
        [event.target.name]: event.target.value,
      }),
    );
  }, []);

  const onValidate = useCallback((): boolean => {
    const validationErrors: RSVPFlyoutComponentErrors = {};
    if (!boolean().required().isValidSync(values.attendance)) {
      validationErrors.attendance = 'components.flyouts.rsvp.errors.missing-attendance';
    }
    if (
      !object({
        entree: string<EntreeOptions>().when('attendance', {
          is: true,
          then: schema => schema.oneOf(Object.values(EntreeOptions)).required(),
        }),
      }).isValidSync(values)
    ) {
      validationErrors.entree = 'components.flyouts.rsvp.errors.missing-entree';
    }
    if (!string().required().isValidSync(values.message)) {
      validationErrors.message = 'components.flyouts.rsvp.errors.missing-message';
    }
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [values]);

  const [shouldRenderSavedMessage, setShouldRenderSavedMessage] = useState<boolean>(false);
  const clearSavedMessageTimeout = useRef<NodeJS.Timeout>();

  const onSavedChanges = useCallback((): void => {
    setShouldRenderSavedMessage(true);
    waitForElement('.' + styles.savedChangesMessageTimer, (element: Element): void => {
      document.querySelector<HTMLElement>('.' + flyoutStyles.flyout)?.scrollTo({
        behavior: 'smooth',
        top: 0,
      });
      element.animate([{ width: '100%' }, { width: '0%' }], { duration: 30000, iterations: 1 });
      if (clearSavedMessageTimeout.current) {
        clearTimeout(clearSavedMessageTimeout.current);
        clearSavedMessageTimeout.current = undefined;
      }
      clearSavedMessageTimeout.current = setTimeout((): void => {
        try {
          setShouldRenderSavedMessage(false);
        } finally {
          clearSavedMessageTimeout.current = undefined;
        }
      }, 30000);
    });
  }, []);

  const onSubmit = useCallback(
    async (event): Promise<void> => {
      event.preventDefault();
      if (onValidate()) {
        setSwitchToUser(undefined);
        setIsSaving(true);
        const response = await fetch('/api/rsvp/' + selectedGuestId, {
          body: JSON.stringify({
            attendance: values.attendance,
            dietaryRestrictions: values.dietaryRestrictions,
            entree: values.entree,
            mailingAddress: values.mailingAddress,
            message: values.message,
          }),
          cache: 'no-store',
          method: 'POST',
        });
        setIsSaving(false);
        const responseJson: ResponseData = await response.json();
        mutate(
          (currentData?: {
            guests: GuestData[];
            responses: ResponseData[];
          }): { guests: GuestData[]; responses: ResponseData[] } => {
            const responses = [...(currentData?.responses || [])];
            const index = responses.findIndex((response: ResponseData): boolean => {
              return response.guest === selectedGuestId;
            });
            if (index > -1) {
              Object.assign(responses[index], responseJson);
            } else {
              responses.push(responseJson);
            }
            return {
              guests: [],
              ...currentData,
              responses,
            };
          },
        );
        onSavedChanges();
      }
    },
    [mutate, onSavedChanges, onValidate, selectedGuestId, values],
  );

  const guests = useMemo<GuestData[]>(() => data?.guests || [], [data]);

  const currentGuestName = useMemo<string>(() => {
    return guests.find((guest: GuestData) => guest.id === selectedGuestId)?.name || '';
  }, [guests, selectedGuestId]);

  const renderDismissWarning = useCallback(
    (): JSX.Element => (
      <div className={classNames(styles.warningMessage, styles.dismissWarning)}>
        {Translate.t('components.flyouts.rsvp.unsaved-changes.dismiss', {
          guest: currentGuestName,
        })}
        <div className={styles.buttonRow}>
          <Button
            className={styles.filledButton}
            onClick={(): void => {
              setIsOpen(false, true);
              if (setShouldRenderDismissWarning) {
                setShouldRenderDismissWarning(false);
              }
            }}
          >
            {Translate.t('components.flyouts.rsvp.unsaved-changes.buttons.discard-and-close')}
          </Button>
          <Button
            className={styles.outlinedButton}
            onClick={(): void => {
              if (setShouldRenderDismissWarning) {
                setShouldRenderDismissWarning(false);
              }
            }}
          >
            {Translate.t('components.flyouts.rsvp.unsaved-changes.buttons.cancel')}
          </Button>
        </div>
      </div>
    ),
    [currentGuestName, setIsOpen, setShouldRenderDismissWarning],
  );

  const renderGuestPartySelector = useCallback((): JSX.Element => {
    if (guests.length <= 1) {
      return (
        <Fragment>
          {shouldRenderSavedMessage && (
            <div className={styles.savedChangesMessage}>
              {Translate.t('components.flyouts.rsvp.saved-changes')}
              <div className={styles.savedChangesMessageTimer} />
            </div>
          )}
        </Fragment>
      );
    }
    return (
      <div className={styles.guests}>
        <div>{Translate.t('components.flyouts.rsvp.guests.description')}</div>
        <div className={styles.buttonRow}>
          {guests.map((guest: GuestData) => {
            const isSelected = guest.id === selectedGuestId;
            return (
              <Button
                className={classNames(isSelected ? styles.filledButton : styles.outlinedButton, styles.guestButton)}
                key={guest.id}
                onClick={(): void => {
                  if (isSelected) {
                    return;
                  } else if (didValuesChange) {
                    setSwitchToUser(guest.id);
                  } else {
                    setSelectedGuestId(guest.id);
                    if (setShouldRenderDismissWarning) {
                      setShouldRenderDismissWarning(false);
                    }
                    setShouldRenderSavedMessage(false);
                  }
                }}
                type="button"
              >
                {isSelected && <CheckIconSVG />}
                {guest.name}
              </Button>
            );
          })}
        </div>
        {switchToUser && (
          <div className={classNames(styles.warningMessage, styles.guestSwitchWarning)}>
            {Translate.t('components.flyouts.rsvp.unsaved-changes.guest-switch', {
              currentGuest: currentGuestName,
              selectedGuest: guests.find((guest: GuestData) => guest.id === switchToUser)?.name || '',
            })}
            <div className={styles.buttonRow}>
              <Button
                className={styles.filledButton}
                onClick={(): void => {
                  setSelectedGuestId(switchToUser);
                  setSwitchToUser(undefined);
                  if (setShouldRenderDismissWarning) {
                    setShouldRenderDismissWarning(false);
                  }
                  setShouldRenderSavedMessage(false);
                }}
              >
                {Translate.t('components.flyouts.rsvp.unsaved-changes.buttons.discard-and-switch')}
              </Button>
              <Button className={styles.outlinedButton} onClick={(): void => setSwitchToUser(undefined)}>
                {Translate.t('components.flyouts.rsvp.unsaved-changes.buttons.cancel')}
              </Button>
            </div>
          </div>
        )}
        {shouldRenderSavedMessage && (
          <div className={classNames(styles.savedChangesMessage, styles.savedChangesMessageInverse)}>
            {Translate.t('components.flyouts.rsvp.saved-changes')}
            <div className={styles.savedChangesMessageTimer} />
          </div>
        )}
      </div>
    );
  }, [
    currentGuestName,
    didValuesChange,
    guests,
    selectedGuestId,
    setShouldRenderDismissWarning,
    shouldRenderSavedMessage,
    switchToUser,
  ]);

  const renderSubmitButtonContent = useCallback((): JSX.Element | string => {
    if (isSaving) {
      return (
        <Fragment>
          <LoadingHeart className={styles.submitButtonLoading} inverse />
          <span>{Translate.t('components.flyouts.rsvp.buttons.saving')}</span>
        </Fragment>
      );
    }
    if (isEditMode) {
      return Translate.t('components.flyouts.rsvp.buttons.save-changes');
    }
    return Translate.t('components.flyouts.rsvp.buttons.submit');
  }, [isEditMode, isSaving]);

  if (isLoading) {
    const randomQuestionAndAnswerWidths = new Array(5)
      .fill(undefined)
      .map((): string[] => [
        (50 + Math.ceil(Math.random() * 50)).toString() + '%',
        (75 + Math.ceil(Math.random() * 25)).toString() + '%',
      ]);
    return (
      <div className={styles.content}>
        <Skeleton height="2.5rem" inverse width={100} />
        <Skeleton height="14.5rem" inverse style={{ marginTop: '2rem' }} width="100%" />
        <Skeleton
          height="2rem"
          inverse
          style={{ marginTop: '2rem' }}
          width={(25 + Math.ceil(Math.random() * 50)).toString() + '%'}
        />
        {randomQuestionAndAnswerWidths.map(
          ([questionWidth, answerWidth]: string[], index: number): JSX.Element => (
            <Fragment key={index}>
              <Skeleton height="1.5rem" inverse style={{ marginTop: '2rem' }} width={questionWidth} />
              <Skeleton height="1.5rem" inverse style={{ marginTop: '1rem' }} width={answerWidth} />
            </Fragment>
          ),
        )}
        <center style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '2rem' }}>
          <Skeleton height="2.5rem" inverse style={{ borderRadius: '1.25rem' }} width={125} />
          <Skeleton height="2.5rem" inverse style={{ borderRadius: '1.25rem', marginLeft: '1.5rem' }} width={80} />
        </center>
      </div>
    );
  }

  return (
    <form className={styles.content} onSubmit={onSubmit}>
      <div className={styles.title}>{Translate.t('components.flyouts.rsvp.title')}</div>
      {renderGuestPartySelector()}
      {shouldRenderDismissWarning && renderDismissWarning()}
      <div className={styles.header}>
        {Translate.t('components.flyouts.rsvp.headers.response', {
          name: currentGuestName,
        })}
      </div>
      <div className={styles.question}>{Translate.t('components.flyouts.rsvp.questions.attendance')}</div>
      <Select
        inverse
        name="attendance"
        onChange={onAddressInputChange}
        options={attendanceOptions}
        placeholder={Translate.t('components.flyouts.rsvp.placeholders.attendance')}
        value={values.attendance}
      />
      {errors.attendance && <div className={styles.error}>{Translate.t(errors.attendance)}</div>}
      {values.attendance !== undefined && (
        <Fragment>
          {values.attendance === true && (
            <Fragment>
              <div className={styles.question}>{Translate.t('components.flyouts.rsvp.questions.entree')}</div>
              <Select
                inverse
                name="entree"
                onChange={onAddressInputChange}
                options={entreeOptions}
                placeholder={Translate.t('components.flyouts.rsvp.placeholders.entree')}
                value={values.entree}
              />
              {errors.entree && <div className={styles.error}>{Translate.t(errors.entree)}</div>}
              <div className={styles.question}>
                {Translate.t('components.flyouts.rsvp.questions.dietary-restrictions')}
              </div>
              <TextInput
                inverse
                name="dietaryRestrictions"
                onChange={onInputChange}
                placeholder={Translate.t('components.flyouts.rsvp.placeholders.dietary-restrictions')}
                value={values.dietaryRestrictions}
              />
              {errors.dietaryRestrictions && (
                <div className={styles.error}>{Translate.t(errors.dietaryRestrictions)}</div>
              )}
            </Fragment>
          )}
          <div className={styles.question}>{Translate.t('components.flyouts.rsvp.questions.mailing-address')}</div>
          <AddressInput
            inverse
            name="mailingAddress"
            onChange={onAddressInputChange}
            placeholder={Translate.t('components.flyouts.rsvp.placeholders.mailing-address')}
            value={values.mailingAddress}
          />
          {errors.mailingAddress && <div className={styles.error}>{Translate.t(errors.mailingAddress)}</div>}
          <div className={styles.question} onChange={onInputChange}>
            {Translate.t('components.flyouts.rsvp.questions.message')}
          </div>
          <Textarea
            inverse
            name="message"
            onChange={onInputChange}
            placeholder={Translate.t('components.flyouts.rsvp.placeholders.message')}
            rows={1}
            value={values.message}
          />
        </Fragment>
      )}
      {errors.message && <div className={styles.error}>{Translate.t(errors.message)}</div>}
      <div className={styles.buttons}>
        <Button className={styles.submitButton} disabled inverse type="submit">
          {renderSubmitButtonContent()}
        </Button>
        <Button inverse onClick={() => setIsOpen(false, true)}>
          {Translate.t('components.flyouts.rsvp.buttons.cancel')}
        </Button>
      </div>
    </form>
  );
};

export default RSVPFlyoutComponent;
