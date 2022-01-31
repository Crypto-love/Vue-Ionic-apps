import { Client } from '@sendgrid/client';
import sgMail = require('@sendgrid/mail');

const env = process.env;

// Test setClient() method
sgMail.setClient(new Client());

// Test setSubstitutionWrappers() method
sgMail.setSubstitutionWrappers('{{', '}}');

sgMail.setApiKey(env.SENDGRID_API_KEY);

export const sendGridSentEmail = (payload) => {
  sgMail
    .send(payload)
    .then(() => {
      console.log('Email sent');
    })
    .catch((error) => {
      console.error(error);
    });
};
