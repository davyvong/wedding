'use client';

import Translate from 'client/translate';
import { FC, Fragment, useCallback } from 'react';

import styles from './component.module.css';
import { FrequentlyAskedQuestion, frequentlyAskedQuestions } from './constants';

const FrequentlyAskedQuestionsComponent: FC = () => {
  const renderFrequentlyAskedQuestion = useCallback(
    (faq: FrequentlyAskedQuestion, index: number): JSX.Element => (
      <Fragment key={faq.question + index}>
        <div className={styles.faqQuestion}>{Translate.t(faq.question)}</div>
        <div className={styles.faqAnswer}>{Translate.html(faq.answer)}</div>
      </Fragment>
    ),
    [],
  );

  return (
    <div className={styles.faq} id="faq">
      <div className={styles.faqTitle}>{Translate.t('components.frequently-asked-questions.title')}</div>
      {frequentlyAskedQuestions.map(renderFrequentlyAskedQuestion)}
    </div>
  );
};

export default FrequentlyAskedQuestionsComponent;
