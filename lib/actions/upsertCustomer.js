'use strict';
const { messages } = require('elasticio-node');
const co = require('co');
const mailchimp = require('mailchimp-v3');

const common = require('../common.js');

exports.getStores = common.getStores;
exports.process = processAction;

/**
 * Main function that push data to MailChimp
 * @param msg
 * @param conf
 */
function processAction(msg, conf) {
    const self = this;
    const apiKey = conf.apiKey, body = msg.body || {}, storeId = conf.storeId;

    co(function*() {
        if (!storeId) {
            throw new Error('Error in configuration, can not find the list ID in configuration parameters');
        }
        if (!body.email_address) {
            throw Error('Error in incoming data, required parameter email_address in incoming message is missing');
        }
        if (!body.id) {
            throw Error('Error in incoming data, required parameter id in incoming message is missing');
        }
        if (!conf.apiKey) {
            throw Error('Error in incoming configuration, required parameter apiKey is missing');
        }
        mailchimp.setApiKey(apiKey);
        // Check the opt_in_status in body, it is string but should be boolean
        body.opt_in_status = body.opt_in_status === "true";
        self.logger.info('Pushing data to mailchimp payload...');
        const response = yield mailchimp.put('/ecommerce/stores/' + storeId + '/customers/' + body.id, body);
        self.logger.info('Response received');
        this.emit('data', messages.newMessageWithBody(response));
        this.emit('end');
    }.bind(this)).catch(err => {
        self.logger.error('Error occurred');
        this.emit('error', err);
        this.emit('end');
    });
}
