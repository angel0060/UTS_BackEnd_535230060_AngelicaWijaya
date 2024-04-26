const { User } = require('../../../models');
const { Time } = require('../../../models');

/**
 * Get user by email for login information
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

async function createTimeOut(email) {
  const currentTime = new Date().toLocaleString();
  return Time.create({
    email,
    currentTime,
  });
}

async function checkTimeOut(email) {
  return Time.findOne({ email });
}

module.exports = {
  getUserByEmail,
  createTimeOut,
  checkTimeOut,
};
