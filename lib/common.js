'use strict';
const co = require('co');
const mailchimp = require('mailchimp-v3');

exports.getLists = getLists;
exports.getStores = getStores;

/**
 * Function that returns values for the list selection box
 *
 * @param conf
 * @param cb
 */
function getLists(conf, cb) {
    const self = this;

    co(function*() {
        self.logger.info('Fetching lists');

        mailchimp.setApiKey(conf.apiKey);
        const lists = yield mailchimp
            .get('lists');
        let result = {};
        lists.lists.map((list) => {
            result[list.id] = list.name
        });
        self.logger.info('Fetch list got result');
        cb(null, result);
    }).catch(err => {
        self.logger.error('Error occurred');
        cb(err);
    });
}



/**
 * Function that returns stores from e-commerce API
 *
 * @param conf
 * @param cb
 */
function getStores(conf, cb) {
    const self = this;

    co(function*() {
        self.logger.info('Fetching stores');

        mailchimp.setApiKey(conf.apiKey);
        const lists = yield mailchimp
            .get('ecommerce/stores');
        let result = {};
        lists.stores.map((store) => {
            result[store.id] = store.name
        });
        self.logger.info('Get stores got result');
        cb(null, result);
    }).catch(err => {
        self.logger.error('Error occurred');
        cb(err);
    });
}

