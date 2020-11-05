const { messages } = require('elasticio-node');
const mailchimp = require('mailchimp-v3');
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
      throw new Error('Error in incoming data, required parameter email is missing');
    }
    mailchimp.setApiKey(apiKey);
    const hash = md5(body.email.toLowerCase());
    const resource = `/lists/${listId}/members/${hash}`;
    self.logger.info('Trying to delete the resource');
    const response = await mailchimp.delete(resource);
    self.logger.info('Response received');
    await this.emit('data', messages.newMessageWithBody(response));
    this.emit('end');
  } catch (err) {
    self.logger.error('Error occurred!');
    this.emit('error', err);
    this.emit('end');
  }
}

exports.getLists = common.getLists;
exports.process = processAction;
