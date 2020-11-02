const messages = require('elasticio-node').messages;
const co = require('co');
const mailchimp = require('mailchimp-v3');
const common = require('../common.js');
const md5 = require('md5');

exports.getLists = common.getLists;
exports.process = processAction;

/**
 * Main function that push data to MailChimp
 * @param msg
 * @param conf
 */
function processAction(msg, conf) {
    const self = this;
    const apiKey = conf.apiKey, body = msg.body || {}, listId = conf.listId;

    co(function*() {
        if (!listId) {
            return onError(new Error('Error in configuration, can not find the list ID in configuration parameters'));
        }
        if (!body.email) {
            return onError(new Error('Error in incoming data, required parameter email is missing'));
        }
        mailchimp.setApiKey(apiKey);
        const hash = md5(body.email.toLowerCase());
        const resource = `/lists/${listId}/members/${hash}`
        self.logger.info('Trying to delete the resource');
        const response = yield mailchimp.delete('/lists/' + listId + '/members/' + hash);
        self.logger.info('Response received');
        this.emit('data', messages.newMessageWithBody(response));
        this.emit('end');
    }.bind(this)).catch(err => {
        self.logger.error('Error occurred');
        this.emit('error', err);
        this.emit('end');
    });
}
