const express = require('express');

const authenticationControllers = require('./authentication-controller');
const authenticationValidators = require('./authentication-validator');
const celebrate = require('../../../core/celebrate-wrappers');
const { rateLimit } = require('express-rate-limit');
const { errorResponder, errorTypes } = require('../../../core/errors');

const route = express.Router();

module.exports = (app) => {
  const error = errorResponder(
    errorTypes.FORBIDDEN,
    'Too many failed login attempts'
  );

  const limiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: {
      error,
      message: 'Too many failed login attempts, try again in 30 minutes',
    },
    Headers: true,
    skipSuccessfulRequests: true,
  });

  app.use('/authentication', limiter, route);

  route.post(
    '/login',
    celebrate(authenticationValidators.login),
    authenticationControllers.login,
    async () => {
      if (authenticationControllers.login != error) {
        limiter.resetKey();
      }
    }
  );
};
