const authenticationRepository = require('./authentication-repository');
const { generateToken } = require('../../../utils/session-token');
const { passwordMatched } = require('../../../utils/password');

/**
 * Check username and password for login.
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {object} An object containing, among others, the JWT token if the email and password are matched. Otherwise returns null.
 */
async function checkLoginCredentials(email, password) {
  const user = await authenticationRepository.getUserByEmail(email);

  // We define default user password here as '<RANDOM_PASSWORD_FILTER>'
  // to handle the case when the user login is invalid. We still want to
  // check the password anyway, so that it prevents the attacker in
  // guessing login credentials by looking at the processing time.
  const userPassword = user ? user.password : '<RANDOM_PASSWORD_FILLER>';
  const passwordChecked = await passwordMatched(password, userPassword);

  // Because we always check the password (see above comment), we define the
  // login attempt as successful when the `user` is found (by email) and
  // the password matches.
  if (user && passwordChecked) {
    const currentDateTime = new Date().toLocaleString();
    return {
      email: user.email,
      name: user.name,
      user_id: user.id,
      token: generateToken(user.email, user.id),
      message: `Successful Login at ${currentDateTime}`,
    };
  }

  return null;
}

async function createTimeOut(ip) {
  const currentTime = new Date().toLocaleString();
  const timeOut = await authenticationRepository.createTimeOut(ip, currentTime);
  if (!timeOut) {
    return null;
  }
  return true;
}

async function checkTimeOut(ip) {
  const timeOut = await authenticationRepository.checkTimeOut(ip);
  if (!timeOut) {
    return null;
  }
  return timeOut.time;
}

async function deleteTimeOut(ip) {
  const timeOut = await authenticationRepository.deleteTimeOut(ip);
  if (!timeOut) {
    return null;
  }
  return true;
}

async function saveAttempt(ip, attempts) {
  const attempt = await authenticationRepository.saveAttempt(ip, attempts);
  if (!attempt) {
    return null;
  }
  return true;
}

async function updateAttempt(ip, attempts) {
  const attempt = await authenticationRepository.updateAttempt(ip, attempts);
  if (!attempt) {
    return null;
  }
  return true;
}

async function getAttempt(ip) {
  const attemptt = await authenticationRepository.getAttempt(ip);
  if (!attemptt) {
    return null;
  }
  return attemptt.attempt;
}

async function deleteAttempt(ip) {
  const attempt = await authenticationRepository.deleteAttempt(ip);
  if (!attempt) {
    return null;
  }
  return attempt;
}

module.exports = {
  checkLoginCredentials,
  createTimeOut,
  checkTimeOut,
  deleteTimeOut,
  saveAttempt,
  updateAttempt,
  getAttempt,
  deleteAttempt,
};
