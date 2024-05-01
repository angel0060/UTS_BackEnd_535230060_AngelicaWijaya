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
    const ip = request.ip; // request ip untuk keperluan menyimpan data attempt dan time out di database

    let attempts = await authenticationServices.getAttempt(ip); // mengambil data attempt dari database jika ada
    if (!attempts) {
      attempts = 0; // jika tidak ada di database, maka attempts = 0
    }

    if (attempts == 5) {
      // jika sudah mencapai limit 5 attempts
      const timeOut = await authenticationServices.checkTimeOut(ip);

      // inisialisasi tanggal dan waktu untuk message display error
      const currentDate = new Date().toLocaleDateString();
      const currentTime = new Date().toLocaleTimeString();
      if (timeOut == false) {
        // memanggil ulang fungsi login
        login(request, response, next);
      } else {
        // menampilkan error time out
        throw errorResponder(
          errorTypes.FORBIDDEN,
          `Too many failed login attempts, try again in 30 minutes`,
          `Error terjadi pada tanggal ${currentDate} jam ${currentTime}`
        );
      }
    } else {
      // Check login credentials
      const loginSuccess = await authenticationServices.checkLoginCredentials(
        ip,
        email,
        password
      );

      if (!loginSuccess) {
        // jika tidak berhasil login
        attempts = attempts + 1;
        const loginFailed = await authenticationServices.loginFailed(
          ip,
          attempts
        );
        if (loginFailed == true) {
          // inisiaslisasi tanggal dan waktu untuk message display error
          const currentDate = new Date().toLocaleDateString();
          const currentTime = new Date().toLocaleTimeString();
          if (attempts == 5) {
            // jika attempts = 5, maka message: sudah mecapai limit
            throw errorResponder(
              errorTypes.INVALID_CREDENTIALS,
              `Wrong email or password`,
              `Gagal login. Login attempt ke-5 (limit reached), pada tanggal ${currentDate} jam ${currentTime} `
            );
          }
          // menampilkan error saat gagal login
          throw errorResponder(
            errorTypes.INVALID_CREDENTIALS,
            `Wrong email or password`,
            `Gagal login. Login attempt ke-${attempts}, pada tanggal ${currentDate} jam ${currentTime} `
          );
        }
      } else {
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
