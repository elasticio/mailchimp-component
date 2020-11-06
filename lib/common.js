const mailchimp = require('mailchimp-v3');

/**
 * Function that returns values for the list selection box
 *
 * @param conf
 */
async function getLists(conf) {
  const self = this;

  try {
    self.logger.info('Fetching lists');

    mailchimp.setApiKey(conf.apiKey);
    const lists = await mailchimp.get('lists');
    const result = {};
    // eslint-disable-next-line array-callback-return
    lists.lists.map((list) => {
      result[list.id] = list.name;
    });
    self.logger.info('Fetch list got result');
    return result;
  } catch (err) {
    self.logger.error('Error occurred');
    throw err;
  }
}


/**
 * Function that returns stores from e-commerce API
 *
 * @param conf
 */
async function getStores(conf) {
  const self = this;

  try {
    self.logger.info('Fetching stores');

    mailchimp.setApiKey(conf.apiKey);
    const lists = await mailchimp.get('ecommerce/stores');
    const result = {};
    // eslint-disable-next-line array-callback-return
    lists.stores.map((store) => {
      result[store.id] = store.name;
    });
    self.logger.info('Get stores got result');
    return result;
  } catch (err) {
    self.logger.error('Error occurred');
    throw err;
  }
}

exports.getLists = getLists;
exports.getStores = getStores;
