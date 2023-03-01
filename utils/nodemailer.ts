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
