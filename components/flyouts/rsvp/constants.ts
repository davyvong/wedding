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
  { label: Translate.t('components.flyouts.rsvp.options.entree.beef'), value: EntreeOptions.Beef },
  { label: Translate.t('components.flyouts.rsvp.options.entree.chicken'), value: EntreeOptions.Chicken },
  { label: Translate.t('components.flyouts.rsvp.options.entree.fish'), value: EntreeOptions.Fish },
  { label: Translate.t('components.flyouts.rsvp.options.entree.vegetarian'), value: EntreeOptions.Vegetarian },
];
