const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { process, getLists, getMetaModel } = require('../../lib/actions/subscribe');
const { getContext, creds } = require('../common');

chai.use(chaiAsPromised);
const { expect } = chai;

describe('subscribe', () => {
  let listId;

  it('should get lists', async () => {
    const context = getContext();
    const lists = await getLists.call(context, creds);
    expect(lists).to.be.an('object');
    const listIds = Object.keys(lists);
    expect(listIds.length).to.be.greaterThan(0, 'No lists found in this account');
    [listId] = listIds;
  });

  it('should get dynamic metadata (merge fields)', async () => {
    if (!listId) {
      throw new Error('List ID not found');
    }
    const cfg = { ...creds, listId };
    const context = getContext();
    const meta = await getMetaModel.call(context, cfg);
    expect(meta.in.properties).to.have.property('email');
    expect(Object.keys(meta.in.properties).length).to.be.greaterThan(6);
  });

  it('should subscribe user', async () => {
    if (!listId) {
      throw new Error('List ID not found');
    }

    const msg = {
      body: {
        email: `test_${Date.now()}@elastic.io`,
        salutation: 'Mr.',
        firstName: 'userName',
        lastName: 'latName',
        language: 'de',
        notes: 'test notes',
      },
    };
    const cfg = { listId };
    const context = getContext();
    await process.call(context, msg, { ...creds, ...cfg });
    const calls = context.emit.getCalls();

    expect(calls.length).to.be.equal(2);
    expect(calls[0].args[0]).to.be.equal('data');
    expect(calls[0].args[1].body.email_address).to.be.equal(msg.body.email);
    expect(calls[1].args[0]).to.be.equal('end');
  });
});
