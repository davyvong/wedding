'use client';

import AutocompleteInput from 'components/autocomplete-input';
import useTranslate from 'hooks/translate';
import { FC, Fragment, useCallback, useState } from 'react';
import { MDBGuestData } from 'server/models/guest';
import { MDBInviteData } from 'server/models/invite';
import { MDBResponseData } from 'server/models/response';

import styles from './component.module.css';

interface RSVPFormProps {
  guests: MDBGuestData[];
  id: string;
  invite: MDBInviteData;
  responses: MDBResponseData[];
}

interface RSVPFormValues {
  attendance: string;
  dietaryRestrictions: string;
  entree: string;
  mailingAddress: string;
  message: string;
}

const RSVPForm: FC<RSVPFormProps> = () => {
  const [values, setValues] = useState<RSVPFormValues>({
    attendance: '',
    dietaryRestrictions: '',
    entree: '',
    mailingAddress: '',
    message: '',
  });
  const { t } = useTranslate();

  const onAutocompleteChange = useCallback((name: string, value: string): void => {
    setValues(
      (prevState: RSVPFormValues): RSVPFormValues => ({
        ...prevState,
        [name]: value,
      }),
    );
  }, []);

  const onInputChange = useCallback((event): void => {
    setValues(
      (prevState: RSVPFormValues): RSVPFormValues => ({
        ...prevState,
        [event.target.name]: event.target.value,
      }),
    );
  }, []);

  return (
    <Fragment>
      <form className={styles.form}>
        <div className={styles.step}>
          <div className={styles.question}>{t('components.rsvp-form.questions.attendance')}</div>
          <input name="attendance" onChange={onInputChange} />
        </div>
        <div className={styles.step}>
          <div className={styles.question}>{t('components.rsvp-form.questions.entree')}</div>
          <input name="entree" onChange={onInputChange} />
        </div>
        <div className={styles.step}>
          <div className={styles.question}>{t('components.rsvp-form.questions.dietaryRestrictions')}</div>
          <input name="dietaryRestrictions" onChange={onInputChange} />
        </div>
        <div className={styles.step}>
          <div className={styles.question}>{t('components.rsvp-form.questions.mailingAddress')}</div>
          <AutocompleteInput name="mailingAddress" onChange={onAutocompleteChange} value={values.mailingAddress} />
        </div>
        <div className={styles.step}>
          <div className={styles.question} onChange={onInputChange}>
            {t('components.rsvp-form.questions.message')}
          </div>
          <textarea name="message" onChange={onInputChange} rows={5} />
        </div>
      </form>
    </Fragment>
  );
};

export default RSVPForm;
