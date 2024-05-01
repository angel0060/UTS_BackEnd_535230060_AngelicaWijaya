const authenticationRepository = require('./authentication-repository');
const { generateToken } = require('../../../utils/session-token');
const { passwordMatched } = require('../../../utils/password');

/**
 * Check username and password for login.
 * @param {string} ip - IP address
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {object} An object containing, among others, the JWT token if the email and password are matched. Otherwise returns null.
 */
async function checkLoginCredentials(ip, email, password) {
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
    // jika login berhasil, attempt di hapus
    await authenticationRepository.deleteAttempt(ip);

    // inisialisasi tanggal untuk message
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

/**
 * Check time out
 * @param {string} ip - IP address
 * @returns {Promise}
 */
async function checkTimeOut(ip) {
  // mengecek apakah ada waktu time out di database
  const checkTime = await checkingTimeOut(ip);

  // // tanggal dan waktu untuk return message display error
  // checkTime.setTime(checkTime.getTime() + 1 * 60 * 1000);
  // const Time = checkTime.toLocaleString();

  if (!checkTime) {
    const time = new Date().toLocaleString();
    // jika tidak ada, maka membuat time out baru
    await authenticationRepository.createTimeOut(ip, time);
    return true;
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
      await authenticationRepository.deleteAttempt(ip);

      // menghapus time out di database
      await authenticationRepository.deleteTimeOut(ip);

      return false;
    } else {
      return true;
    }
  }
}

/**
 * Login Failed
 * @param {string} ip - IP address
 * @param {number} attempts - Attempts
 * @returns {Promise}
 */
async function loginFailed(ip, attempts) {
  if (attempts == 1) {
    // jika attempt yg pertama, maka menyimpan attempt ke database
    const success = await authenticationRepository.saveAttempt(ip, attempts);
    if (success == true) {
      return true;
    }
  } else {
    // jika attempt yg kedua dan seterusnya, maka meng-update attempt di database
    const success = await authenticationRepository.updateAttempt(ip, attempts);
    return true;
  }
}

/**
 * Checking time out
 * @param {string} ip - IP address
 * @returns {Promise}
 */
async function checkingTimeOut(ip) {
  const timeOut = await authenticationRepository.checkTimeOut(ip);
  if (!timeOut) {
    return null;
  }
  return timeOut.time;
}

/**
 * Get Attempt
 * @param {string} ip - IP address
 * @returns {Promise}
 */
async function getAttempt(ip) {
  const attemptt = await authenticationRepository.getAttempt(ip);
  if (!attemptt) {
    return null;
  }
  return attemptt.attempt;
}

module.exports = {
  checkLoginCredentials,
  checkingTimeOut,
  checkTimeOut,
  loginFailed,
  getAttempt,
};
