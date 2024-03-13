'use client';

import { Dispatch, FC, FormEvent, SetStateAction, useCallback, useState } from 'react';

import { signScavengerHuntToken } from './actions';

interface ScavengerHuntUsernameComponentProps {
  setHasUsername: Dispatch<SetStateAction<boolean>>;
}

const ScavengerHuntUsernameComponent: FC<ScavengerHuntUsernameComponentProps> = ({ setHasUsername }) => {
  const [error, setError] = useState<string>();
  const [username, setUsername] = useState<string>('');

  const onChange = useCallback((event): void => {
    setUsername(event.target.value);
  }, []);

  const onSubmit = useCallback(
    async (event: FormEvent): Promise<void> => {
      try {
        event.preventDefault();
        const errorMessage = await signScavengerHuntToken({ username });
        if (errorMessage) {
          setError(errorMessage);
        } else {
          setHasUsername(true);
        }
      } catch {
        //
      }
    },
    [setHasUsername, username],
  );

  return (
    <form onSubmit={onSubmit}>
      <input onChange={onChange} type="text" value={username} />
      {error && <span>{error}</span>}
    </form>
  );
};

export default ScavengerHuntUsernameComponent;
