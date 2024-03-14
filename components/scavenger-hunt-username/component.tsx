'use client';

import AlternateEmailIconSVG from 'assets/icons/alternate-email.svg';
import classNames from 'classnames';
import { vidaloka } from 'client/fonts';
import Translate from 'client/translate';
import scavengerHuntStyles from 'components/scavenger-hunt/component.module.css';
import { Dispatch, FC, FormEvent, SetStateAction, useCallback, useState } from 'react';
import { string } from 'yup';

import { signScavengerHuntToken } from './actions';
import styles from './component.module.css';

interface ScavengerHuntUsernameComponentProps {
  setHasUsername: Dispatch<SetStateAction<boolean>>;
}

const ScavengerHuntUsernameComponent: FC<ScavengerHuntUsernameComponentProps> = ({ setHasUsername }) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [username, setUsername] = useState<string>('');

  const onChange = useCallback((event): void => {
    setUsername(event.target.value);
    const validationErrors: Set<string> = new Set();
    if (event.target.value.length !== 0 && !string().required().min(3).max(24).isValidSync(event.target.value)) {
      validationErrors.add('components.scavenger-hunt-username.errors.length');
    }
    if (
      !string()
        .matches(/^[a-zA-Z0-9_]*$/)
        .isValidSync(event.target.value)
    ) {
      validationErrors.add('components.scavenger-hunt-username.errors.characters');
    }
    setErrors(Array.from(validationErrors));
  }, []);

  const onSubmit = useCallback(
    async (event: FormEvent): Promise<void> => {
      try {
        event.preventDefault();
        if (errors.length > 0) {
          return;
        }
        const validationErrors = await signScavengerHuntToken(username);
        if (validationErrors.length > 0) {
          setErrors(validationErrors);
        } else {
          setHasUsername(true);
        }
      } catch {
        //
      }
    },
    [errors, setHasUsername, username],
  );

  const renderError = useCallback(
    (error: string): JSX.Element => (
      <div className={styles.errorMessage} key={error}>
        {Translate.t(error)}
      </div>
    ),
    [],
  );

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={classNames(scavengerHuntStyles.instructions, vidaloka.className)}>
        {Translate.t('components.scavenger-hunt-username.instructions')}
      </div>
      <div className={styles.inputWrapper}>
        <input
          className={styles.textInput}
          onChange={onChange}
          placeholder={Translate.t('components.scavenger-hunt-username.placeholders.username')}
          type="text"
          value={username}
        />
        <AlternateEmailIconSVG className={styles.usernamePrefix} />
      </div>
      <div className={styles.validationErrors}>{errors.map(renderError)}</div>
      <button className={styles.submitButton} type="submit">
        {Translate.t('components.scavenger-hunt-username.buttons.participate')}
      </button>
    </form>
  );
};

export default ScavengerHuntUsernameComponent;
