import * as yup from 'yup';

export const isEmail = (value): boolean => yup.string().required().email().isValidSync(value);

export const isIP = (value): boolean =>
  yup
    .string()
    .required()
    .min(7)
    .max(15)
    .matches(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/)
    .isValidSync(value);

export const isLoginCode = (value): boolean =>
  yup
    .string()
    .required()
    .matches(/^([a-z]+)-([a-z]+)-([a-z]+)-([a-z]+)$/)
    .isValidSync(value);

export const isObjectId = (value): boolean =>
  yup
    .string()
    .required()
    .length(24)
    .matches(/^[0-9a-fA-F]{24}$/)
    .isValidSync(value);

export const isSpotifySearchQuery = (value): boolean => yup.string().required().min(1).max(256).isValidSync(value);
