const mongoose = require('mongoose');
const config = require('../core/config');
const logger = require('../core/logger')('app');

const usersSchema = require('./users-schema');
const timeOutSchema = require('./time-out-schema');
const attemptLoginSchema = require('./attempt-login-schema');

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

module.exports = {
  mongoose,
  User,
  Time,
  attemptLogin,
};
