/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable max-len */
/* eslint-disable import/first */
process.env.LOG_LEVEL = 'TRACE';
process.env.LOG_OUTPUT_MODE = 'short';
const getLogger = require('@elastic.io/component-logger');
const sinon = require('sinon');
const { existsSync } = require('fs');
const { config } = require('dotenv');

if (existsSync('.env')) {
  config();
  const {
    API_KEY,
  } = process.env;
  if (!API_KEY) {
    throw new Error('Please, provide all environment variables');
  }
} else {
  throw new Error('Please, provide environment variables to .env');
}
const {
  API_KEY,
} = process.env;

module.exports = {
  creds: {
    apiKey: API_KEY,
  },
  getContext: () => ({
    logger: getLogger(),
    emit: sinon.spy(),
  }),
};
