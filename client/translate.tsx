import ClientEnvironment from 'client/environment';
import messages from 'constants/messages.json';
import parse, { Element } from 'html-react-parser';
import { Fragment } from 'react';

export default class Translate {
  public static t(key: string, values: Record<string, string> = {}): string {
    try {
      const message = messages[key];
      if (!message) {
        throw new Error('Unable to translate: ' + key);
      }
      let messageWithValues = message;
      for (const key of Object.keys(values)) {
        messageWithValues = messageWithValues.replace('{{' + key + '}}', values[key]);
      }
      return messageWithValues;
    } catch (error: unknown) {
      if (ClientEnvironment.isDevelopment) {
        console.log(`Translate.t error=${error}`);
      }
      return '';
    }
  }

  public static html(key: string, values?: Record<string, string>): JSX.Element {
    const compiledMessage = Translate.t(key, values);
    return (
      <Fragment>
        {parse(compiledMessage, {
          replace(domNode) {
            if (domNode instanceof Element) {
              if (domNode.type === 'tag' && domNode.name === 'flyoutlink') {
                const onClick = (): void => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('open', domNode.attribs.to);
                  window.history.pushState({ path: url.href }, '', url.href);
                };
                return <a onClick={onClick}>{domNode.attribs.text}</a>;
              }
            }
            return null;
          },
        })}
      </Fragment>
    );
  }
}
