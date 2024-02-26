import Translate from 'client/translate';
import type { SelectOption } from 'components/form/select/component';

export const attendanceOptions: SelectOption[] = [
  { label: Translate.t('components.flyouts.rsvp.options.attendance.yes'), value: true },
  { label: Translate.t('components.flyouts.rsvp.options.attendance.no'), value: false },
];

export enum EntreeOptions {
  Beef = 'beef',
  Chicken = 'chicken',
  Fish = 'fish',
  Vegetarian = 'vegetarian',
}

export const entreeOptions: SelectOption[] = [
  {
    description: Translate.t('components.flyouts.rsvp.options.entree-description.chicken'),
    label: Translate.t('components.flyouts.rsvp.options.entree.chicken'),
    value: EntreeOptions.Chicken,
  },
  {
    description: Translate.t('components.flyouts.rsvp.options.entree-description.fish'),
    label: Translate.t('components.flyouts.rsvp.options.entree.fish'),
    value: EntreeOptions.Fish,
  },
  {
    description: Translate.t('components.flyouts.rsvp.options.entree-description.beef'),
    label: Translate.t('components.flyouts.rsvp.options.entree.beef'),
    value: EntreeOptions.Beef,
  },
  {
    description: Translate.t('components.flyouts.rsvp.options.entree-description.vegetarian'),
    label: Translate.t('components.flyouts.rsvp.options.entree.vegetarian'),
    value: EntreeOptions.Vegetarian,
  },
];
