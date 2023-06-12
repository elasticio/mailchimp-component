// eslint-disable-next-line no-unused-vars
const mailchimp = require('mailchimp-v3');

module.exports = async function verifyCredentials(cfg) {
  mailchimp.setApiKey(cfg.apiKey);
  await mailchimp.get('/ping');
  return true;
};
