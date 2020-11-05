const logger = require('@elastic.io/component-logger')();

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const nock = require('nock');
const sinon = require('sinon');

const action = require('../../lib/actions/unsubscribe');

chai.use(chaiAsPromised);
const { expect } = chai;

describe('Subscribe action', () => {
  let emitter;

  beforeEach(() => {
    emitter = {
      emit: sinon.spy(),
      logger,
    };
  });

  it('should emit (data and end events on success create request - case: http 200', async () => {
    const msg = {
      body: {
        email: 'foo@bar.com',
      },
    };

    const cfg = {
      listId: 'listID',
      apiKey: 'apiKey-us5',
    };

    nock('https://us5.api.mailchimp.com:443', { encodedQueryParams: true })
      .delete('/3.0//lists/listID/members/f3ada405ce890b6f8204094deb12d8a8').reply(204);

    await action.process.call(emitter, msg, cfg, {});

    const calls = emitter.emit.getCalls();
    expect(calls.length).to.be.equal(2);
    expect(calls[0].args[0]).to.be.equal('data');
    expect(calls[0].args[1].body).to.be.deep.equal({});
    expect(calls[1].args[0]).to.be.equal('end');
  });
});
