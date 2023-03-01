import * as fs from 'fs';
import * as path from 'path';

import * as handlebars from 'handlebars';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  auth: {
    user: process.env.NODEMAILER_USERNAME,
    pass: process.env.NODEMAILER_PASSWORD,
  },
  service: process.env.NODEMAILER_SERVICE,
});

export const getTransporter = () => transporter;

export const getEmailTemplate = (templatePath: string, context: Record<string, string> = {}): string => {
  const __dirname = path.resolve();
  const filePath = path.join(__dirname, templatePath);
  const source = fs.readFileSync(filePath, 'utf-8').toString();
  const template = handlebars.compile(source);
  const html = template(context);
  return html;
};
