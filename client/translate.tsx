import ClientEnvironment from 'client/environment';
import messages from 'constants/messages.json';
import parse, { Element } from 'html-react-parser';
import template from 'lodash.template';
import { Fragment } from 'react';

export default class Translate {
  public static t(key: string, values?: Record<string, string>): string {
    try {
      const message = messages[key];
      if (!message) {
        throw new Error('Unable to translate: ' + key);
      }
      const options = {
        interpolate: /{{([\s\S]+?)}}/g,
      };
      return template(message, options)(values);
    } catch (error: unknown) {
      if (ClientEnvironment.isDevelopment) {
        console.log((error as Error).message);
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
