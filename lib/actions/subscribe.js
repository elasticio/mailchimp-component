const { messages } = require('elasticio-node');
const mailchimp = require('mailchimp-v3');
const moment = require('moment');
const md5 = require('md5');

const common = require('../common.js');

/**
 * Main function that push data to MailChimp
 * @param msg
 * @param conf
 */
async function processAction(msg, conf) {
  const self = this;
  const { apiKey } = conf;
  const body = msg.body || {};
  const { listId } = conf;

  try {
    if (!listId) {
      throw new Error('Error in configuration, can not find the list ID in configuration parameters');
    }
    if (!body.email) {
      throw Error('Error in incoming data, required parameter email is missing');
    }
    if (!conf.apiKey) {
      throw Error('Error in incoming configuration, required parameter apiKey is missing');
    }

    mailchimp.setApiKey(apiKey);

    const mergeVars = {
      EMAIL: body.email,
      FNAME: body.firstName,
      LNAME: body.lastName,
      SALUTATION: body.salutation,
      OPTIN_IP: body.optInIP,
      OPTIN_TIME: moment(body.optInDate).format('YYYY-MM-DD HH:mm:ss'), // "2013-12-30 20:30:00",
      MC_LANGUAGE: body.language || 'en',
      MC_NOTES: body.notes,
    };
    const payload = {
      id: listId,
      email_address: body.email,
      status: 'subscribed',
      merge_fields: mergeVars,
      email_type: conf.email_type || 'html',
      ip_opt: body.optInIP,
    };

    self.logger.info('Pushing data to mailchimp payload...');
    const hash = md5(body.email.toLowerCase());
    const response = await mailchimp.put(`/lists/${listId}/members/${hash}`, payload);
    self.logger.info('Received response');
    this.emit('data', messages.newMessageWithBody(response));
    this.emit('end');
  } catch (err) {
    self.logger.error('Error occured');
    this.emit('error', err);
    this.emit('end');
  }
}

exports.getLists = common.getLists;
exports.process = processAction;
