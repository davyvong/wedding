import * as yup from 'yup';

export const isEmail = (value: string): boolean => yup.string().required().email().isValidSync(value);

export const isIP = (value: string): boolean =>
  yup
    .string()
    .required()
    .min(7)
    .max(15)
    .matches(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/)
    .isValidSync(value);

export const isLoginCode = (value: string): boolean =>
  yup
    .string()
    .required()
    .matches(/^([a-z]+)-([a-z]+)-([a-z]+)-([a-z]+)$/)
    .isValidSync(value);

export const isObjectId = (value: string): boolean =>
  yup
    .string()
    .required()
    .length(24)
    .matches(/^[0-9a-fA-F]{24}$/)
    .isValidSync(value);

export const isSpotifySearchQuery = (value: string): boolean =>
  yup.string().required().min(1).max(256).isValidSync(value);

export const isSpotifyURIList = (value: string[]): boolean =>
  yup
    .array()
    .of(
      yup
        .string()
        .required()
        .matches(/^spotify:track:([a-zA-Z0-9]){22}/),
    )
    .required()
    .min(1)
    .isValidSync(value);
