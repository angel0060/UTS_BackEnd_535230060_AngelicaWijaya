const { User, Time, attemptLogin } = require('../../../models');

/**
 * Get user by email for login information
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

async function createTimeOut(email, time) {
  return Time.create({
    email,
    time,
  });
}

async function checkTimeOut(email) {
  return Time.findOne({ email });
}

async function deleteTimeOut(email) {
  return Time.deleteOne({ email: email });
}

async function saveAttempt(email, attempt) {
  return attemptLogin.create({
    email,
    attempt,
  });
}

async function updateAttempt(email, attempt) {
  return attemptLogin.updateOne(
    {
      email: email,
    },
    {
      $set: {
        attempt,
      },
    }
  );
}

async function getAttempt(email) {
  return attemptLogin.findOne({ email });
}

async function deleteAttempt(email) {
  return attemptLogin.deleteOne({ email: email });
}

module.exports = {
  getUserByEmail,
  createTimeOut,
  checkTimeOut,
  deleteTimeOut,
  saveAttempt,
  updateAttempt,
  getAttempt,
  deleteAttempt,
};
