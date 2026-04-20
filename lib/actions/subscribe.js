const mailchimp = require('mailchimp-v3');
const moment = require('moment');
const md5 = require('md5');

const common = require('../common');

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
      throw Error('Error in incoming data, required parameter email is missing');
    }
    if (!conf.apiKey) {
      throw Error('Error in incoming configuration, required parameter apiKey is missing');
    }

    mailchimp.setApiKey(apiKey);

    const payload = {
      id: listId,
      email_address: body.email,
      status: 'subscribed',
      merge_fields: {
        EMAIL: body.email,
      },
      email_type: body.email_type || 'html',
      ip_opt: body.optInIP,
    };

    // Standard root-level fields in msg.body that should NOT go into merge_fields blindly
    // Map standard fields back to merge fields for legacy support
    const legacyMapping = {
      firstName: 'FNAME',
      lastName: 'LNAME',
      salutation: 'SALUTATION',
      ansprache: 'ANSPRACHE',
    };

    Object.keys(legacyMapping).forEach((oldKey) => {
      const tag = legacyMapping[oldKey];
      if (body[oldKey] && !payload.merge_fields[tag]) {
        payload.merge_fields[tag] = body[oldKey];
      }
    });

    // Handle extra legacy fields
    payload.merge_fields.OPTIN_IP = body.optInIP;
    payload.merge_fields.OPTIN_TIME = moment().format();
    payload.merge_fields.MC_LANGUAGE = body.language || 'en';
    payload.merge_fields.MC_NOTES = body.notes;

    // Finally, allow any custom tags from the body to override or add to merge_fields
    Object.keys(body).forEach((key) => {
      // If it's not a known standard field, treat it as a potential merge tag
      const standardFields = ['email', 'email_type', 'optInIP', 'optInDate', 'language', 'notes', ...Object.keys(legacyMapping)];
      if (!standardFields.includes(key) && !payload.merge_fields[key]) {
        payload.merge_fields[key] = body[key];
      }
    });

    if (body.language) payload.merge_fields.MC_LANGUAGE = body.language;
    if (body.notes) payload.merge_fields.MC_NOTES = body.notes;
    if (body.optInDate) {
      payload.merge_fields.OPTIN_TIME = moment(body.optInDate).format('YYYY-MM-DD HH:mm:ss');
    }

    self.logger.info('Pushing data to mailchimp payload...');
    const hash = md5(body.email.toLowerCase());
    const response = await mailchimp.put(`/lists/${listId}/members/${hash}`, payload);
    self.logger.info('Received response');
    await this.emit('data', common.messages.newMessageWithBody(response));
    this.emit('end');
  } catch (err) {
    self.logger.error('Error occured: ', JSON.stringify(err));
    this.emit('error', err);
    this.emit('end');
  }
}

async function getMetaModel(cfg) {
  const self = this;
  mailchimp.setApiKey(cfg.apiKey);
  const metadata = {
    in: {
      type: 'object',
      properties: {
        email: {
          title: 'Email',
          type: 'string',
          required: true,
        },
        email_type: {
          title: 'Email type',
          type: 'string',
          required: true,
          enum: ['html', 'text'],
          default: 'html',
        },
        optInIP: {
          title: 'Opt-in IP address',
          type: 'string',
          required: false,
        },
        optInDate: {
          title: 'Opt-in Date',
          type: 'string',
          required: false,
        },
        language: {
          title: 'Language (ISO)',
          type: 'string',
          required: false,
          placeholder: 'en',
          default: 'en',
        },
        notes: {
          title: 'Notes',
          type: 'string',
          required: false,
        },
      },
    },
    out: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email_address: { type: 'string' },
        status: { type: 'string' },
        unique_email_id: { type: 'string' },
      },
    },
  };

  if (cfg.listId) {
    try {
      const result = await mailchimp.get(`/lists/${cfg.listId}/merge-fields`);
      if (result && result.merge_fields) {
        result.merge_fields.forEach((field) => {
          // Avoid overwriting standard fields
          if (!metadata.in.properties[field.tag]) {
            metadata.in.properties[field.tag] = {
              title: field.name,
              type: 'string',
              required: field.required,
            };
          }
        });
      }
    } catch (e) {
      self.logger.error('Error fetching merge fields: ', e.message);
    }
  }
  return metadata;
}

exports.getLists = common.getLists;
exports.process = processAction;
exports.getMetaModel = getMetaModel;
