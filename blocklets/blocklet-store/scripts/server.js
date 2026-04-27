/* eslint-disable no-console */
require('dotenv-flow').config();

const nodemon = require('nodemon'); // eslint-disable-line import/no-extraneous-dependencies

nodemon({
  script: 'api/dev.js',
  ext: 'js json',
  stdout: true,
  verbose: false,
  colours: true,
  legacyWatch: true,
  env: {
    ...process.env,
  },
  watch: ['./api'],
}).on('log', (log) => console.log(log.colour));
