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

    const mergeVars ={
      FNAME: "Elinore",
      LNAME: "Grady",
      BIRTHDAY: "01/22",
      ADDRESS: {
          addr1: "123 Freddie Ave",
          city: "Atlanta",
          state: "GA",
          zip: "12345",
      }
   };
    const payload = {
      id: listId,
      email_address: body.email,
      status: 'subscribed',
      merge_fields: mergeVars,
      email_type: body.email_type || 'html',
      ip_opt: body.optInIP,
    };

    self.logger.info('Pushing data to mailchimp payload...');
    const hash = md5(body.email.toLowerCase());
    const response = await mailchimp.put(`/lists/${listId}/members/${hash}`, payload);
    self.logger.info('Received response');
    await this.emit('data', messages.newMessageWithBody(response));
    this.emit('end');
  } catch (err) {
    self.logger.error('Error occured');
    this.emit('error', err);
    this.emit('end');
  }
}

exports.getLists = common.getLists;
exports.process = processAction;
