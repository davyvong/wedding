export interface FrequentlyAskedQuestion {
  answer: string;
  params?: Record<string, string>;
  question: string;
  token: boolean;
}

export const frequentlyAskedQuestions: FrequentlyAskedQuestion[] = [
  {
    answer: 'components.frequently-asked-questions.answers.what-is-the-dress-code',
    params: {
      bride: 'rgb(208, 99, 62)',
      groom: 'rgb(240, 212, 181)',
    },
    question: 'components.frequently-asked-questions.questions.what-is-the-dress-code',
    token: true,
  },
  {
    answer: 'components.frequently-asked-questions.answers.how-to-respond-to-invitation',
    question: 'components.frequently-asked-questions.questions.how-to-respond-to-invitation',
    token: false,
  },
  {
    answer: 'components.frequently-asked-questions.answers.when-is-the-rsvp-deadline',
    question: 'components.frequently-asked-questions.questions.when-is-the-rsvp-deadline',
    token: false,
  },
  {
    answer: 'components.frequently-asked-questions.answers.i-did-not-receive-an-email',
    question: 'components.frequently-asked-questions.questions.i-did-not-receive-an-email',
    token: false,
  },
];
