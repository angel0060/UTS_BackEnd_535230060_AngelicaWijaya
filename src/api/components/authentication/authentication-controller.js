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

      // inisialisasi tanggal dan waktu untuk message display error
      const currentDate = new Date().toLocaleDateString();
      const currentTime = new Date().toLocaleTimeString();

      // mengecek apakah ada waktu time out di database
      const checkTime = await authenticationServices.checkTimeOut(ip);

      if (!checkTime) {
        // jika tidak ada, maka membuat time out baru
        const create = await authenticationServices.createTimeOut(ip);
        if (!create) {
          throw errorResponder(
            errorTypes.UNPROCESSABLE_ENTITY,
            'Failed to create time out'
          );
        }
      } else {
        // jika sudah ada data time out di database

        // inisialisasi variabel untuk kondisi if time out
        // waktu sekarang
        const currentD = new Date().getDate();
        const currentT = new Date().getTime();
        // waktu yang telah disimpan di database
        const date = checkTime.getDate();
        const time = checkTime.getTime();

        // membuat kondisi if time out
        if (
          // jika sudah berbeda hari
          currentD != date ||
          // atau jika pada hari yang sama, waktu sekarang sudah melebihi waktu database + 30 menit
          (currentD == date && currentT > time + 30 * 60 * 1000)
        ) {
          // menghapus attempt di database
          const success = await authenticationServices.deleteAttempt(ip);
          if (!success) {
            throw errorResponder(
              errorTypes.UNPROCESSABLE_ENTITY,
              'Failed to delete login attempt'
            );
          }

          // menghapus time out di database
          const timeOut = await authenticationServices.deleteTimeOut(ip);
          if (!timeOut) {
            throw errorResponder(
              errorTypes.UNPROCESSABLE_ENTITY,
              'Failed to delete time out'
            );
          }

          // memanggil ulang fungsi login setelah menghapus attempt di database
          if (success == true) {
            login(request, response, next);
          }
        } else {
          // untuk menampilkan kapan time out berakhir
          const Date = checkTime.toLocaleDateString();
          checkTime.setTime(checkTime.getTime() + 30 * 60 * 1000);
          const Time = checkTime.toLocaleTimeString();

          // menampilkan error jika time out belum habis
          throw errorResponder(
            errorTypes.FORBIDDEN,
            `Too many failed login attempts, try again at ${Date} ${Time}`
          );
        }
      }
      // menampilkan error time out
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
        // jika tidak berhasil login
        attempts = attempts + 1;
        if (attempts == 1) {
          // jika attempt yg pertama, maka menyimpan attempt ke database
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
          // jika attempt yg kedua dan seterusnya, maka meng-update attempt di database
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
      } else {
        // jika login berhasil, attempt di hapus
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
