const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { process, getStores } = require('../../lib/actions/upsertCustomer');
const { getContext, creds } = require('../common');

chai.use(chaiAsPromised);
const { expect } = chai;

describe('Upsert Customer', () => {
  let storeId;

  it('should get stores (dynamic field)', async () => {
    const context = getContext();
    const stores = await getStores.call(context, creds);
    expect(stores).to.be.an('object');
    const storeIds = Object.keys(stores);
    expect(storeIds.length).to.be.greaterThan(0, 'No stores found in this account, cannot proceed with upsert test');
    [storeId] = storeIds;
    context.logger.info(`Using store: ${stores[storeId]} (${storeId})`);
  });

  it('should upsert customer', async () => {
    if (!storeId) {
      throw new Error('Store ID not found in previous step');
    }

    const customerId = `cust_${Date.now()}`;
    const msg = {
      body: {
        id: customerId,
        email_address: `antigravity.test.${Date.now()}@elastic.io`,
        opt_in_status: 'true',
        first_name: 'Test',
        last_name: 'User',
      },
    };

    const cfg = { ...creds, storeId };
    const context = getContext();

    await process.call(context, msg, cfg);

    const calls = context.emit.getCalls();
    expect(calls.length).to.be.equal(2);
    expect(calls[0].args[0]).to.be.equal('data');
    expect(calls[0].args[1].body.email_address).to.be.equal(msg.body.email_address);
    expect(calls[1].args[0]).to.be.equal('end');
  });
});
