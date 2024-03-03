'use client';

import Translate from 'client/translate';
import { FC, Fragment, useCallback, useMemo } from 'react';
import { VerifiedGuestTokenPayload } from 'server/authenticator';

import styles from './component.module.css';
import { FrequentlyAskedQuestion, frequentlyAskedQuestions } from './constants';

export interface FrequentlyAskedQuestionsComponentProps {
  token?: VerifiedGuestTokenPayload;
}

const FrequentlyAskedQuestionsComponent: FC<FrequentlyAskedQuestionsComponentProps> = ({ token }) => {
  const filteredFAQ = useMemo<FrequentlyAskedQuestion[]>(() => {
    return frequentlyAskedQuestions.filter((faq: FrequentlyAskedQuestion): boolean => {
      if (token) {
        return true;
      }
      return faq.token === false;
    });
  }, [token]);

  const renderFrequentlyAskedQuestion = useCallback(
    (faq: FrequentlyAskedQuestion, index: number): JSX.Element => (
      <Fragment key={faq.question + index}>
        <div className={styles.faqQuestion}>{Translate.t(faq.question)}</div>
        <div className={styles.faqAnswer}>{Translate.html(faq.answer, faq.params)}</div>
      </Fragment>
    ),
    [],
  );

  return (
    <div className={styles.faq} id="faq">
      <div className={styles.faqTitle}>{Translate.t('components.frequently-asked-questions.title')}</div>
      {filteredFAQ.map(renderFrequentlyAskedQuestion)}
    </div>
  );
};

export default FrequentlyAskedQuestionsComponent;
