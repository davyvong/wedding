import * as yup from 'yup';

class Validator {
  public static isEmail(value: string): boolean {
    return yup.string().required().email().isValidSync(value);
  }

  public static isIP(value: string): boolean {
    return yup
      .string()
      .required()
      .min(7)
      .max(15)
      .matches(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/)
      .isValidSync(value);
  }

  public static isLoginCode(value: string): boolean {
    return yup
      .string()
      .required()
      .matches(/^([a-z]+)-([a-z]+)-([a-z]+)-([a-z]+)$/)
      .isValidSync(value);
  }

  public static isObjectId(value: string): boolean {
    return yup
      .string()
      .required()
      .length(24)
      .matches(/^[0-9a-fA-F]{24}$/)
      .isValidSync(value);
  }

  public static isSpotifySearchQuery(value: string): boolean {
    return yup.string().required().min(1).max(256).isValidSync(value);
  }

  public static isSpotifyURIList(value: string[]): boolean {
    return yup
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
  }
}

export default Validator;
