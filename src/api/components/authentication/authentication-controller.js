const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('./authentication-service');

const currentDate = new Date().toLocaleDateString();
const currentTime = new Date().toLocaleTimeString();

/**
 * Handle login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function login(request, response, next) {
  const { email, password } = request.body;

  let attempts = authenticationServices.getAttempt(email);
  if (!attempts) {
    attempts = 0;
  }

  try {
    if (attempts == 5) {
      const checkTime = await authenticationServices.checkTimeOut(email);
      if (!checkTime) {
        authenticationServices.createTimeOut(email);
      } else if (checkTime + 30) {
        authenticationServices.deleteAttempt(email);
        authenticationServices.deleteTimeOut(email);
        login();
      }
      throw errorResponder(
        errorTypes.FORBIDDEN,
        `Too many failed login attempts, try again in 30 minutes`,
        `Current time : ${currentDate}`
      );
    } else {
      // Check login credentials
      const loginSuccess = await authenticationServices.checkLoginCredentials(
        email,
        password
      );

      if (!loginSuccess) {
        attempts = attempts + 1;
        authenticationServices.saveAttempt(email, attempts);
        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          `Wrong email or password`,
          `Login attempt ke-${attempts}, pada tanggal ${currentDate} jam ${currentTime} `
        );
      } else {
        authenticationServices.deleteAttempt(email);
        return response.status(200).json(loginSuccess);
      }
    }
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
};
