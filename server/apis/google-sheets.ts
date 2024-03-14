import ServerEnvironment from 'server/environment';

class GoogleSheetsAPI {
  public static async refreshGuestListSheet(): Promise<boolean> {
    if (!ServerEnvironment.isProduction) {
      return false;
    }
    await fetch(process.env.GOOGLE_SHEETS_WEDDING_WEBHOOK, {
      cache: 'no-store',
      method: 'GET',
    });
    return true;
  }
}

export default GoogleSheetsAPI;
