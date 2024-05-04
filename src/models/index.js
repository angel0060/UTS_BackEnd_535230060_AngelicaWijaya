const mongoose = require('mongoose');
const config = require('../core/config');
const logger = require('../core/logger')('app');

const usersSchema = require('./users-schema');
const timeOutSchema = require('./time-out-schema');
const attemptLoginSchema = require('./attempt-login-schema');
const accountSchema = require('./account-digital-banking-schema');
const transactionSchema = require('./transaction-digital-banking-schema');

mongoose.connect(`${config.database.connection}/${config.database.name}`, {
  useNewUrlParser: true,
});

const db = mongoose.connection;
db.once('open', () => {
  logger.info('Successfully connected to MongoDB');
});

const User = mongoose.model('users', mongoose.Schema(usersSchema));

const Time = mongoose.model('Login Time Out', mongoose.Schema(timeOutSchema));

const attemptLogin = mongoose.model(
  'Login attempts',
  mongoose.Schema(attemptLoginSchema)
);

const Account = mongoose.model(
  'Accounts Digital Banking',
  mongoose.Schema(accountSchema)
);

const bankTime = mongoose.model(
  'Digital Banking Login Time Out',
  mongoose.Schema(timeOutSchema)
);

const bankLogin = mongoose.model(
  'Digital Banking Login attempts',
  mongoose.Schema(attemptLoginSchema)
);

const Transaction = mongoose.model(
  'Digital Banking Transaction History',
  mongoose.Schema(transactionSchema)
);

module.exports = {
  mongoose,
  User,
  Time,
  attemptLogin,
  Account,
  bankTime,
  bankLogin,
  Transaction,
};
