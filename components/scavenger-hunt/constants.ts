import Translate from 'client/translate';

export enum ScavengerHuntTaskId {
  Cake = 'cake',
  CandidMoment = 'candid-moment',
  FirstDance = 'first-dance',
  Food = 'food',
  GroupPhoto = 'group-photo',
  PeckOnCheek = 'peck-on-cheek',
  TearsOfJoy = 'tears-of-joy',
  ToastOrSpeech = 'toast-or-speech',
  WeddingDecoration = 'wedding-decoration',
  YourOutfit = 'your-outfit',
}

export interface ScavengerHuntTask {
  id: ScavengerHuntTaskId;
  name: string;
}

export const scavengerHuntTasks: ScavengerHuntTask[] = [
  {
    id: ScavengerHuntTaskId.YourOutfit,
    name: Translate.t('components.scavenger-hunt.items.your-outfit'),
  },
  {
    id: ScavengerHuntTaskId.TearsOfJoy,
    name: Translate.t('components.scavenger-hunt.items.tears-of-joy'),
  },
  {
    id: ScavengerHuntTaskId.Cake,
    name: Translate.t('components.scavenger-hunt.items.cake'),
  },
  {
    id: ScavengerHuntTaskId.GroupPhoto,
    name: Translate.t('components.scavenger-hunt.items.group-photo'),
  },
  {
    id: ScavengerHuntTaskId.Food,
    name: Translate.t('components.scavenger-hunt.items.food'),
  },
  {
    id: ScavengerHuntTaskId.FirstDance,
    name: Translate.t('components.scavenger-hunt.items.first-dance'),
  },
  {
    id: ScavengerHuntTaskId.WeddingDecoration,
    name: Translate.t('components.scavenger-hunt.items.wedding-decoration'),
  },
  {
    id: ScavengerHuntTaskId.ToastOrSpeech,
    name: Translate.t('components.scavenger-hunt.items.toast-or-speech'),
  },
  {
    id: ScavengerHuntTaskId.PeckOnCheek,
    name: Translate.t('components.scavenger-hunt.items.peck-on-cheek'),
  },
  {
    id: ScavengerHuntTaskId.CandidMoment,
    name: Translate.t('components.scavenger-hunt.items.candid-moment'),
  },
];
