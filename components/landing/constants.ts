import VD13JPG from 'assets/images/VD-13.jpg';
import VD22JPG from 'assets/images/VD-22.jpg';
import VD26JPG from 'assets/images/VD-26.jpg';
import VD50JPG from 'assets/images/VD-50.jpg';
import VD83JPG from 'assets/images/VD-83.jpg';
import { StaticImageData } from 'next/image';
import { CSSProperties } from 'react';

export interface EngagementPhoto {
  alt: string;
  src: StaticImageData;
  style?: CSSProperties;
}

export const engagementPhotos: EngagementPhoto[] = [
  {
    alt: 'VD22',
    src: VD22JPG,
  },
  {
    alt: 'VD13',
    src: VD13JPG,
  },
  {
    alt: 'VD83',
    src: VD83JPG,
    style: { objectPosition: '52% center' },
  },
  {
    alt: 'VD50',
    src: VD50JPG,
    style: { objectPosition: '12% center' },
  },
  {
    alt: 'VD26',
    src: VD26JPG,
    style: { objectPosition: '51% center' },
  },
];

export interface CoupleQuestion {
  answer: string;
  question: string;
}

export const coupleQuestions: CoupleQuestion[] = [
  {
    answer: 'components.landing.answers.where-is-the-ceremoney-and-reception',
    question: 'components.landing.questions.where-is-the-ceremoney-and-reception',
  },
  {
    answer: 'components.landing.answers.i-did-not-receive-an-email',
    question: 'components.landing.questions.i-did-not-receive-an-email',
  },
  {
    answer: 'components.landing.answers.how-to-respond-to-invitation',
    question: 'components.landing.questions.how-to-respond-to-invitation',
  },
];
