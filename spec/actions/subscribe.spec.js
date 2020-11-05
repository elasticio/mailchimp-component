const logger = require('@elastic.io/component-logger')();

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const nock = require('nock');
const sinon = require('sinon');

const action = require('../../lib/actions/subscribe');

const memberPutReply = require('../data/memberPutReply.json');

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
        firstName: 'Renat',
        lastName: 'Zubairov',
        salutation: 'MR',
        optInIP: '192.168.1.1',
        notes: 'Notes',
      },
    };

    const cfg = {
      listId: 'listID',
      apiKey: 'apiKey-us5',
    };

    nock('https://us5.api.mailchimp.com', { encodedQueryParams: true })
      .put('/3.0//lists/listID/members/f3ada405ce890b6f8204094deb12d8a8',
        {
          id: 'listID',
          email_address: 'foo@bar.com',
          status: 'subscribed',
          merge_fields: {
            EMAIL: 'foo@bar.com',
            FNAME: 'Renat',
            LNAME: 'Zubairov',
            SALUTATION: 'MR',
            OPTIN_IP: '192.168.1.1',
            OPTIN_TIME: /20/,
            MC_LANGUAGE: 'en',
            MC_NOTES: 'Notes',
          },
          email_type: 'html',
          ip_opt: '192.168.1.1',
        }).reply(200, memberPutReply);

    await action.process.call(emitter, msg, cfg, {});

    const calls = emitter.emit.getCalls();
    expect(calls.length).to.be.equal(2);
    expect(calls[0].args[0]).to.be.equal('data');
    expect(calls[0].args[1].body.id).to.be.equal('20dbbf20d91106a9377bb671ba83f381');
    expect(calls[1].args[0]).to.be.equal('end');
  });
});
