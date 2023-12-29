import { Connection, connect } from '@planetscale/database';

class MySQLClientFactory {
  private static instance: Connection;

  public static getInstance() {
    if (!MySQLClientFactory.instance) {
      MySQLClientFactory.instance = connect({
        host: process.env.PLANETSCALE_DB_HOST,
        password: process.env.PLANETSCALE_DB_PASSWORD,
        username: process.env.PLANETSCALE_DB_USERNAME,
      });
    }
    return MySQLClientFactory.instance;
  }
}

export default MySQLClientFactory;
