const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('./authentication-service');
let attempts = 5;

function reset() {
  attempts = 5;
}

/**
 * Handle login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function login(request, response, next) {
  const { email, password } = request.body;

  try {
    if (attempts == 0) {
      setTimeout(reset, 30 * 60 * 1000);

      throw errorResponder(
        errorTypes.FORBIDDEN,
        'Too many failed login attempts, try again in 30 minutes'
      );
    } else {
      // Check login credentials
      const loginSuccess = await authenticationServices.checkLoginCredentials(
        email,
        password
      );

      if (!loginSuccess) {
        attempts = attempts - 1;
        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          'Wrong email or password'
        );
      } else {
        attempts = 5;
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
