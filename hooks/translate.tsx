'use client';

import ClientEnvironment from 'client/environment';
import messages from 'constants/messages.json';
import parse from 'html-react-parser';
import template from 'lodash.template';
import { Fragment, useCallback, useMemo } from 'react';

const useTranslate = () => {
  const getMessage = useCallback((key: string): string => messages[key], []);

  const translate = useCallback(
    (key: string, values?: Record<string, string>): string => {
      try {
        const message = getMessage(key);
        const options = {
          interpolate: /{{([\s\S]+?)}}/g,
        };
        return template(message, options)(values);
      } catch {
        if (ClientEnvironment.isDevelopment) {
          console.log('Unable to translate:', key);
        }
        return '';
      }
    },
    [getMessage],
  );

  const translateWithHTML = useCallback(
    (key: string, values?: Record<string, string>): JSX.Element => {
      const compiledMessage = translate(key, values);
      return <Fragment>{parse(compiledMessage)}</Fragment>;
    },
    [translate],
  );

  const returnValue = useMemo(() => ({ html: translateWithHTML, t: translate }), [translate, translateWithHTML]);

  return returnValue;
};

export default useTranslate;
