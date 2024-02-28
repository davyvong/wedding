import nodemailer from 'nodemailer';

class NodemailerClientFactory {
  private static readonly instance = nodemailer.createTransport({
    auth: {
      pass: process.env.NODEMAILER_PASSWORD,
      user: process.env.NODEMAILER_USERNAME,
    },
    host: process.env.NODEMAILER_HOST,
    secure: true,
  });

  public static getInstance() {
    return NodemailerClientFactory.instance;
  }
}

export default NodemailerClientFactory;
