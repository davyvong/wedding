'use client';

import CheckIconSVG from 'assets/icons/check.svg';
import classNames from 'classnames';
import Translate from 'client/translate';
import Button from 'components/button';
import { FlyoutContentComponentProps } from 'components/flyout/component';
import AddressInput from 'components/form/address-input';
import Select from 'components/form/select';
import TextInput from 'components/form/text-input';
import Textarea from 'components/form/textarea';
import LoadingHeart from 'components/loading-heart';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import type { Dispatch, FC, SetStateAction } from 'react';
import { GuestData } from 'server/models/guest';
import { ResponseData } from 'server/models/response';
import { KeyedMutator } from 'swr';
import { boolean, mixed, string } from 'yup';

import styles from './component.module.css';
import { EntreeOptions, attendanceOptions, entreeOptions } from './constants';

interface RSVPFlyoutComponentProps extends FlyoutContentComponentProps {
  guests: GuestData[];
  initialValues?: Partial<RSVPFlyoutComponentValues>;
  isEditMode: boolean;
  mutateDataCache: KeyedMutator<{
    guests: GuestData[];
    responses: ResponseData[];
  }>;
  selectedGuestId: string;
  setSelectedGuestId: Dispatch<SetStateAction<string>>;
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
  guests,
  initialValues,
  isEditMode,
  mutateDataCache,
  selectedGuestId,
  setSelectedGuestId,
  setIsOpen,
}) => {
  const [values, setValues] = useState<RSVPFlyoutComponentValues>({
    ...defaultValues,
    ...initialValues,
  });
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
    if (!mixed<EntreeOptions>().oneOf(Object.values(EntreeOptions)).required().isValidSync(values.entree)) {
      validationErrors.entree = 'components.flyouts.rsvp.errors.missing-entree';
    }
    if (!string().required().isValidSync(values.message)) {
      validationErrors.message = 'components.flyouts.rsvp.errors.missing-message';
    }
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [values]);

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
        mutateDataCache(
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
      }
    },
    [mutateDataCache, onValidate, selectedGuestId, values],
  );

  const renderGuestPartySelector = useCallback(() => {
    if (guests.length <= 1) {
      return null;
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
          <div className={styles.unsavedChangesWarning}>
            {Translate.t('components.flyouts.rsvp.unsaved-changes', {
              currentGuest: guests.find((guest: GuestData) => guest.id === selectedGuestId)?.name || '',
              selectedGuest: guests.find((guest: GuestData) => guest.id === switchToUser)?.name || '',
            })}
            <div className={styles.buttonRow}>
              <Button
                className={styles.filledButton}
                onClick={(): void => {
                  setSelectedGuestId(switchToUser);
                  setSwitchToUser(undefined);
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
      </div>
    );
  }, [didValuesChange, guests, selectedGuestId, setSelectedGuestId, switchToUser]);

  const renderSubmitButtonContent = useCallback(() => {
    if (isSaving) {
      return (
        <Fragment>
          <div className={styles.submitButtonLoading}>
            <LoadingHeart className={styles.submitButtonLoadingHeart} inverse />
          </div>
          <span>{Translate.t('components.flyouts.rsvp.buttons.saving')}</span>
        </Fragment>
      );
    }
    if (isEditMode) {
      return Translate.t('components.flyouts.rsvp.buttons.save-changes');
    }
    return Translate.t('components.flyouts.rsvp.buttons.submit');
  }, [isEditMode, isSaving]);

  useEffect(() => {
    setValues({
      ...defaultValues,
      ...initialValues,
    });
  }, [initialValues, selectedGuestId]);

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.title}>{Translate.t('components.flyouts.rsvp.title')}</div>
      {renderGuestPartySelector()}
      <div className={styles.header}>
        {Translate.t('components.flyouts.rsvp.headers.response', {
          name: guests.find((guest: GuestData) => guest.id === selectedGuestId)?.name || '',
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
      <div className={styles.question}>{Translate.t('components.flyouts.rsvp.questions.dietaryRestrictions')}</div>
      <TextInput
        inverse
        name="dietaryRestrictions"
        onChange={onInputChange}
        placeholder={Translate.t('components.flyouts.rsvp.placeholders.dietaryRestrictions')}
        value={values.dietaryRestrictions}
      />
      {errors.dietaryRestrictions && <div className={styles.error}>{Translate.t(errors.dietaryRestrictions)}</div>}
      <div className={styles.question}>{Translate.t('components.flyouts.rsvp.questions.mailingAddress')}</div>
      <AddressInput
        inverse
        name="mailingAddress"
        onChange={onAddressInputChange}
        placeholder={Translate.t('components.flyouts.rsvp.placeholders.mailingAddress')}
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
      {errors.message && <div className={styles.error}>{Translate.t(errors.message)}</div>}
      <div className={styles.buttons}>
        <Button className={styles.submitButton} disabled={isSaving} inverse type="submit">
          {renderSubmitButtonContent()}
        </Button>
        <Button inverse onClick={() => setIsOpen(false)}>
          {Translate.t('components.flyouts.rsvp.buttons.cancel')}
        </Button>
      </div>
    </form>
  );
};

export default RSVPFlyoutComponent;
