const { User, Time, attemptLogin } = require('../../../models');

/**
 * Get user by email for login information
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

async function createTimeOut(ip, time) {
  return Time.create({
    ip,
    time,
  });
}

async function checkTimeOut(ip) {
  return Time.findOne({ ip });
}

async function deleteTimeOut(ip) {
  return Time.deleteOne({ ip: ip });
}

async function saveAttempt(ip, attempt) {
  return attemptLogin.create({
    ip,
    attempt,
  });
}

async function updateAttempt(ip, attempt) {
  return attemptLogin.updateOne(
    {
      ip: ip,
    },
    {
      $set: {
        attempt,
      },
    }
  );
}

async function getAttempt(ip) {
  return attemptLogin.findOne({ ip });
}

async function deleteAttempt(ip) {
  return attemptLogin.deleteOne({ ip: ip });
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
