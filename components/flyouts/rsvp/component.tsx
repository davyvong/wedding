'use client';

import CheckIconSVG from 'assets/icons/check.svg';
import Translate from 'client/translate';
import Button from 'components/button';
import { FlyoutContentComponentProps } from 'components/flyout/component';
import AddressInput from 'components/form/address-input';
import Select from 'components/form/select';
import TextInput from 'components/form/text-input';
import Textarea from 'components/form/textarea';
import LoadingHeart from 'components/loading-heart';
import { Fragment, useCallback, useEffect, useState } from 'react';
import type { Dispatch, FC, SetStateAction } from 'react';
import { MDBGuestData } from 'server/models/guest';
import { MDBResponseData } from 'server/models/response';
import { useSWRConfig } from 'swr';
import { boolean, mixed, string } from 'yup';

import styles from './component.module.css';
import { EntreeOptions, attendanceOptions, entreeOptions } from './constants';

interface RSVPFlyoutComponentProps extends FlyoutContentComponentProps {
  guests: MDBGuestData[];
  initialValues?: Partial<RSVPFlyoutComponentValues>;
  isEditMode: boolean;
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

  const { mutate } = useSWRConfig();

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
    (event): void => {
      event.preventDefault();
      if (onValidate()) {
        mutate(
          '/api/rsvp',
          async () => {
            setIsSaving(true);
            const response = await fetch('/api/rsvp', {
              body: JSON.stringify({
                attendance: values.attendance,
                dietaryRestrictions: values.dietaryRestrictions,
                entree: values.entree,
                guest: selectedGuestId,
                mailingAddress: values.mailingAddress,
                message: values.message,
              }),
              cache: 'no-store',
              method: 'PUT',
            });
            setIsSaving(false);
            const body: MDBResponseData = await response.json();
            setValues({
              attendance: body.attendance,
              dietaryRestrictions: body.dietaryRestrictions,
              entree: body.entree,
              mailingAddress: body.mailingAddress,
              message: body.message,
            });
            return body;
          },
          {
            populateCache: (updatedResponse, currentCache) => {
              const responses: MDBResponseData[] = [...(currentCache?.responses || [])];
              const index = responses.findIndex((response: MDBResponseData): boolean => {
                return response.guest === updatedResponse.guest;
              });
              if (index > -1) {
                Object.assign(responses[index], updatedResponse);
              } else {
                responses.push(updatedResponse);
              }
              return {
                guests: [],
                ...currentCache,
                responses,
              };
            },
            revalidate: false,
          },
        );
      }
    },
    [mutate, onValidate, selectedGuestId, values],
  );

  const renderGuestPartySelector = useCallback(() => {
    if (guests.length <= 1) {
      return null;
    }
    return (
      <div className={styles.guests}>
        <div>{Translate.t('components.flyouts.rsvp.guests.description')}</div>
        <div className={styles.guestButtons}>
          {guests.map((guest: MDBGuestData) => {
            const isSelected = guest.id === selectedGuestId;
            return (
              <Button
                className={isSelected ? styles.selectedGuestButton : styles.guestButton}
                key={guest.id}
                onClick={() => setSelectedGuestId(guest.id)}
                type="button"
              >
                {isSelected && <CheckIconSVG />}
                {guest.name}
              </Button>
            );
          })}
        </div>
      </div>
    );
  }, [guests, selectedGuestId, setSelectedGuestId]);

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
  }, [initialValues]);

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.title}>{Translate.t('components.flyouts.rsvp.title')}</div>
      {renderGuestPartySelector()}
      <div className={styles.header}>
        {Translate.t('components.flyouts.rsvp.headers.response', {
          name: guests.find((guest: MDBGuestData) => guest.id === selectedGuestId)?.name || '',
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
