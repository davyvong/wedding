import ClientEnvironment from 'client/environment';

class Logger {
  private static readonly isBrowser = typeof window !== 'undefined';

  public static error(error: unknown): void {
    Logger.log(error, 'error');
  }

  public static info(data: unknown): void {
    Logger.log(data, 'info');
  }

  public static log(data: unknown, type: string): void {
    if (Logger.isBrowser && ClientEnvironment.isProduction) {
      return;
    }
    const message = JSON.stringify({
      data,
      timestamp: Date.now(),
      type,
    });
    console.log(message);
  }
}

export default Logger;
