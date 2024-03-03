import ServerEnvironment from 'server/environment';
import Logger from 'utils/logger';

class GoogleSheetsAPI {
  public static async updateGuestListSheet(): Promise<boolean> {
    try {
      if (!ServerEnvironment.isProduction) {
        return false;
      }
      await fetch(process.env.GOOGLE_SHEETS_WEDDING_WEBHOOK, {
        cache: 'no-cache',
        method: 'GET',
      });
      return true;
    } catch (error: unknown) {
      Logger.error(error);
      return false;
    }
  }
}

export default GoogleSheetsAPI;
