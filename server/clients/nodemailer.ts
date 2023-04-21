import nodemailer from 'nodemailer';

class NodemailerClient {
  private static readonly instance = nodemailer.createTransport({
    auth: {
      user: process.env.NODEMAILER_USERNAME,
      pass: process.env.NODEMAILER_PASSWORD,
    },
    service: process.env.NODEMAILER_SERVICE,
  });

  public static getInstance() {
    return NodemailerClient.instance;
  }
}

export default NodemailerClient;
