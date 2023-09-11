import ClientEnvironment from 'client/environment';
import messages from 'constants/messages.json';
import parse from 'html-react-parser';
import template from 'lodash.template';
import { Fragment } from 'react';

export default class Translate {
  public static t(key: string, values?: Record<string, string>): string {
    try {
      const message = messages[key];
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
  }

  public static html(key: string, values?: Record<string, string>): JSX.Element {
    const compiledMessage = Translate.t(key, values);
    return <Fragment>{parse(compiledMessage)}</Fragment>;
  }
}
