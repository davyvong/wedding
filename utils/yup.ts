import * as yup from 'yup';

export const isEmail = value => yup.string().required().email().isValidSync(value);

export const isLoginCode = value =>
  yup
    .string()
    .required()
    .matches(/([a-z]+)-([a-z]+)-([a-z]+)-([a-z]+)/)
    .isValid(value);
