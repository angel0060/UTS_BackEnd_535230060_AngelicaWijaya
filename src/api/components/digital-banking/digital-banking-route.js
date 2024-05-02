const express = require('express');

const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const celebrate = require('../../../core/celebrate-wrappers');
const digitalBankingController = require('./digital-banking-controller');
const digitalBankingValidator = require('./digital-banking-validator');

const route = express.Router();

module.exports = (app) => {
  app.use('/digital-banking', route);

  // Get list of accounts
  route.get(
    '/',
    authenticationMiddleware,
    digitalBankingController.getAccounts
  );

  // Create account
  route.post(
    '/',
    authenticationMiddleware,
    celebrate(digitalBankingValidator.createAccount),
    digitalBankingController.createAccount
  );

  // Get account detail
  route.get(
    '/:id',
    authenticationMiddleware,
    digitalBankingController.getAccount
  );

  // Update account
  route.put(
    '/:id',
    authenticationMiddleware,
    celebrate(digitalBankingValidator.updateAccount),
    digitalBankingController.updateAccount
  );

  // Delete account
  route.delete(
    '/:id',
    authenticationMiddleware,
    digitalBankingController.deleteAccount
  );

  // Change pin
  route.patch(
    '/:id/change-pin',
    authenticationMiddleware,
    celebrate(digitalBankingValidator.changePin),
    digitalBankingController.changePin
  );

  // Withdraw balance
  route.patch(
    '/:id/withdraw-balance',
    authenticationMiddleware,
    celebrate(digitalBankingValidator.withdrawBalance),
    digitalBankingController.withdrawBalance
  );

  // Deposit balance
  route.patch(
    '/:id/deposit-balance',
    authenticationMiddleware,
    celebrate(digitalBankingValidator.depositBalance),
    digitalBankingController.depositBalance
  );

  // Transfer balance
  route.patch(
    '/:id/transfer-balance',
    authenticationMiddleware,
    celebrate(digitalBankingValidator.transferBalance),
    digitalBankingController.transferBalance
  );
};