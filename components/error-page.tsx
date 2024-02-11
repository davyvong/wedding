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
        {Translate.t('app.admin.layout.errorPages.title-with-status-code', {
          statusCode: statusCode.toString(),
          title: Translate.t('app.admin.layout.errorPages.' + statusCode),
        })}
      </title>
    </head>
    <html lang="en">
      <body>
        <NextErrorPage statusCode={statusCode} title={Translate.t('app.admin.layout.errorPages.' + statusCode)} />
      </body>
    </html>
  </Fragment>
);

export default ErrorPage;
