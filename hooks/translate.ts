import messages from 'constants/messages.json';
import template from 'lodash.template';
import { useCallback } from 'react';

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
        return '';
      }
    },
    [getMessage],
  );

  return translate;
};

export default useTranslate;
