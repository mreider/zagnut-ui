var merge = require('webpack-merge');
var prodEnv = require('./prod.env');

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  //BACKEND_URL: '"https://6sprints.com"'
  BACKEND_URL: '"https://pm415.com"'
  // BACKEND_URL: '"http://localhost:3000"'
});
