import { Fragment } from 'react';
import type { FC } from 'react';

interface RSVPGuestListComponentProps {
  data: any;
  error: any;
}

const RSVPGuestListComponent: FC<RSVPGuestListComponentProps> = ({ data, error }) => {
  return (
    <Fragment>
      <pre>{JSON.stringify({ data, error }, null, 2)}</pre>
    </Fragment>
  );
};

export default RSVPGuestListComponent;
