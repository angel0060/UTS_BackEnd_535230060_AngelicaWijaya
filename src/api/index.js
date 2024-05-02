const express = require('express');

const authentication = require('./components/authentication/authentication-route');
const users = require('./components/users/users-route');
const digitalBanking = require('./components/digital-banking/digital-banking-route');

module.exports = () => {
  const app = express.Router();

  authentication(app);
  users(app);
  digitalBanking(app);

  return app;
};
