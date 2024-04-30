const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('./authentication-service');

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
    const ip = request.ip;
    let attempts = await authenticationServices.getAttempt(ip);
    if (!attempts) {
      attempts = 0;
    }

    if (attempts == 5) {
      const currentDate = new Date().toLocaleDateString();
      const currentTime = new Date().toLocaleTimeString();
      const checkTime = await authenticationServices.checkTimeOut(ip);

      if (!checkTime) {
        const create = await authenticationServices.createTimeOut(ip);
        if (!create) {
          throw errorResponder(
            errorTypes.UNPROCESSABLE_ENTITY,
            'Failed to create time out'
          );
        }
      } else {
        const currentD = new Date().getDate();
        const currentT = new Date().getTime();
        const date = checkTime.getDate();
        const time = checkTime.getTime();

        if (
          currentD != date ||
          (currentD == date && currentT > time + 30 * 60 * 1000)
        ) {
          const success = await authenticationServices.deleteAttempt(ip);
          if (!success) {
            throw errorResponder(
              errorTypes.UNPROCESSABLE_ENTITY,
              'Failed to delete login attempt'
            );
          }
          const timeOut = await authenticationServices.deleteTimeOut(ip);
          if (!timeOut) {
            throw errorResponder(
              errorTypes.UNPROCESSABLE_ENTITY,
              'Failed to delete time out'
            );
          }
          login(request, response, next);
        }
      }
      throw errorResponder(
        errorTypes.FORBIDDEN,
        `Too many failed login attempts, try again in 30 minutes`,
        `Error terjadi pada tanggal ${currentDate} jam ${currentTime}`
      );
    } else {
      // Check login credentials
      const loginSuccess = await authenticationServices.checkLoginCredentials(
        email,
        password
      );

      if (!loginSuccess) {
        attempts = attempts + 1;
        if (attempts == 1) {
          const success = await authenticationServices.saveAttempt(
            ip,
            attempts
          );
          if (!success) {
            throw errorResponder(
              errorTypes.UNPROCESSABLE_ENTITY,
              'Failed to save login attempt'
            );
          }
        } else {
          const success = await authenticationServices.updateAttempt(
            ip,
            attempts
          );
          if (!success) {
            throw errorResponder(
              errorTypes.UNPROCESSABLE_ENTITY,
              'Failed to update login attempt'
            );
          }
        }
        const currentDate = new Date().toLocaleDateString();
        const currentTime = new Date().toLocaleTimeString();
        if (attempts == 5) {
          throw errorResponder(
            errorTypes.INVALID_CREDENTIALS,
            `Wrong email or password`,
            `Gagal login. Login attempt ke-5 (limit reached), pada tanggal ${currentDate} jam ${currentTime} `
          );
        }
        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          `Wrong email or password`,
          `Gagal login. Login attempt ke-${attempts}, pada tanggal ${currentDate} jam ${currentTime} `
        );
      } else {
        const success = await authenticationServices.deleteAttempt(ip);
        if (!success) {
          throw errorResponder(
            errorTypes.UNPROCESSABLE_ENTITY,
            'Failed to delete login attempt'
          );
        }
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
