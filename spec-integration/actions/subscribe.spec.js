const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { process } = require('../../lib/actions/subscribe');
const { getContext, creds } = require('../common');

chai.use(chaiAsPromised);
const { expect } = chai;

describe('subscribe', () => {
  it('should subscribe user', async () => {
    const msg = {
      body: {
        email: 'userEmail@elastic.io',
        salutation: 'Mr.',
        firstName: 'userName',
        lastName: 'latName',
        language: 'en',
      },
    };
    const cfg = { listId: '5b24ff2adc' }; // comes from "getLists" function (/lib/common.js)
    const context = getContext();
    await process.call(context, msg, { ...creds, ...cfg });
    const calls = context.emit.getCalls();
    expect(calls.length).to.be.equal(2);
    expect(calls[0].args[0]).to.be.equal('data');
    expect(calls[0].args[1].body.email_address).to.be.equal(msg.body.email);
    expect(calls[1].args[0]).to.be.equal('end');
  });
});
