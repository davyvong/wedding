export interface FrequentlyAskedQuestion {
  answer: string;
  params?: Record<string, string>;
  question: string;
  token: boolean;
}

export const frequentlyAskedQuestions: FrequentlyAskedQuestion[] = [
  {
    answer: 'components.frequently-asked-questions.answers.what-time-should-i-arrive',
    question: 'components.frequently-asked-questions.questions.what-time-should-i-arrive',
    token: false,
  },
  {
    answer: 'components.frequently-asked-questions.answers.is-parking-available',
    question: 'components.frequently-asked-questions.questions.is-parking-available',
    token: false,
  },
  {
    answer: 'components.frequently-asked-questions.answers.what-is-the-dress-code',
    params: {
      bride: 'rgb(208, 99, 62)',
      groom: 'rgb(240, 212, 181)',
    },
    question: 'components.frequently-asked-questions.questions.what-is-the-dress-code',
    token: false,
  },
  {
    answer: 'components.frequently-asked-questions.answers.can-i-post-to-social-media',
    question: 'components.frequently-asked-questions.questions.can-i-post-to-social-media',
    token: false,
  },
  {
    answer: 'components.frequently-asked-questions.answers.where-is-the-gift-registry',
    question: 'components.frequently-asked-questions.questions.where-is-the-gift-registry',
    token: false,
  },
  {
    answer: 'components.frequently-asked-questions.answers.i-did-not-receive-an-email',
    question: 'components.frequently-asked-questions.questions.i-did-not-receive-an-email',
    token: false,
  },
];
