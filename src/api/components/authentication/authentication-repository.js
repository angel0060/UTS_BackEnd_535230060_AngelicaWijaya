const { User, Time, attemptLogin } = require('../../../models');

/**
 * Get user by email for login information
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

/**
 * Create time out
 * @param {string} ip - IP address
 * @param {date} time - Time
 * @returns {Promise}
 */
async function createTimeOut(ip, time) {
  return Time.create({
    ip,
    time,
  });
}

/**
 * Check time out
 * @param {string} ip - IP address
 * @returns {Promise}
 */
async function checkTimeOut(ip) {
  return Time.findOne({ ip });
}

/**
 * Delete time out
 * @param {string} ip - IP address
 * @returns {Promise}
 */
async function deleteTimeOut(ip) {
  return Time.deleteOne({ ip: ip });
}

/**
 * Save Attempt
 * @param {string} ip - IP address
 * @param {number} attempts - Attempts
 * @returns {Promise}
 */
async function saveAttempt(ip, attempt) {
  attemptLogin.create({
    ip,
    attempt,
  });
  return true;
}

/**
 * Update Attempt
 * @param {string} ip - IP address
 * @param {number} attempts - Attempts
 * @returns {Promise}
 */
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

/**
 * Get Attempt
 * @param {string} ip - IP address
 * @returns {Promise}
 */
async function getAttempt(ip) {
  return attemptLogin.findOne({ ip });
}

/**
 * Delete Attempt
 * @param {string} ip - IP address
 * @returns {Promise}
 */
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
