'use client';

import Translate from 'client/translate';
import NextErrorPage from 'next/error';
import { FC, Fragment } from 'react';

interface ErrorPageProps {
  statusCode: number;
}

const ErrorPage: FC<ErrorPageProps> = ({ statusCode }) => (
  <Fragment>
    <head>
      <title>
        {Translate.t('components.error-page.title-with-status-code', {
          statusCode: statusCode.toString(),
          title: Translate.t('components.error-page.status-code.' + statusCode),
        })}
      </title>
    </head>
    <html lang="en">
      <body>
        <NextErrorPage statusCode={statusCode} title={Translate.t('components.error-page.status-code.' + statusCode)} />
      </body>
    </html>
  </Fragment>
);

export default ErrorPage;
