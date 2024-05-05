const digitalBankingService = require('./digital-banking-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

/**
 * Handle login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function login(request, response, next) {
  const { email, pin } = request.body;

  try {
    const ip = request.ip; // request ip untuk keperluan menyimpan data attempt dan time out di database

    let attempts = await digitalBankingService.getAttempt(ip); // mengambil data attempt dari database jika ada
    if (!attempts) {
      attempts = 0; // jika tidak ada di database, maka attempts = 0
    }

    if (attempts == 5) {
      // jika sudah mencapai limit 5 attempts
      const timeOut = await digitalBankingService.checkTimeOut(ip);

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
      const loginSuccess = await digitalBankingService.checkLoginCredentials(
        ip,
        email,
        pin
      );

      if (!loginSuccess) {
        // jika tidak berhasil login
        attempts = attempts + 1;
        const loginFailed = await digitalBankingService.loginFailed(
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
              `Wrong email or pin`,
              `Gagal login. Login attempt ke-5 (limit reached), pada tanggal ${currentDate} jam ${currentTime} `
            );
          }
          // menampilkan error saat gagal login
          throw errorResponder(
            errorTypes.INVALID_CREDENTIALS,
            `Wrong email or pin`,
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

/**
 * Handle get list of users request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getAccounts(request, response, next) {
  try {
    // inisialisasi variabel
    const search = request.query.search; // jika tidak di isi, maka defaultnya adalah kosong
    const sort = request.query.sort; // jika tidak di isi, maka defaultnya adalah sort berdasarkan email: ascending
    const page_number = parseInt(request.query.page_number) - 1; // jika tidak di isi, maka defaultnya adalah 1 (di tulis 0 hanya utk keperluan menghitung)
    const page_size = parseInt(request.query.page_size); // jika tidak di isi, maka defaultnya adalah menampilkan semua data dalam 1 halaman

    const accounts = await digitalBankingService.getAccounts(
      search,
      sort,
      page_number,
      page_size
    );
    if (!accounts) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to Get List of Accounts'
      );
    }
    return response.status(200).json(accounts);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get account detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getAccount(request, response, next) {
  try {
    const account = await digitalBankingService.getAccount(request.params.id);

    if (!account) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown account');
    }

    return response.status(200).json(account);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create account request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createAccount(request, response, next) {
  try {
    const id_number = request.body.id_number;
    const name = request.body.name;
    const email = request.body.email;
    const phone = request.body.phone;
    const birth_place = request.body.birth_place;
    const birth_date = request.body.birth_date.toLocaleDateString();
    const address = request.body.address;
    const pin = request.body.pin;
    const pin_confirm = request.body.pin_confirm;

    // Check confirmation pin
    if (pin !== pin_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'PIN confirmation mismatched'
      );
    }

    // Identity Number must be unique
    const idNumberIsRegistered =
      await digitalBankingService.idNumberIsRegistered(id_number);
    if (idNumberIsRegistered) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Identity Number is already registered'
      );
    }

    // Email must be unique
    const emailIsRegistered =
      await digitalBankingService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    // Phone number must be unique
    const phoneIsRegistered =
      await digitalBankingService.phoneIsRegistered(phone);
    if (phoneIsRegistered) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Phone number is already registered'
      );
    }

    const success = await digitalBankingService.createAccount(
      id_number,
      name,
      email,
      phone,
      birth_place,
      birth_date,
      address,
      pin
    );
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create account'
      );
    }

    return response.status(200).json({
      id_number: id_number,
      name: name,
      message: 'Account successfully created',
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update account request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateAccount(request, response, next) {
  try {
    const id = request.params.id;
    const name = request.body.name;
    const email = request.body.email;
    const phone = request.body.phone;
    const address = request.body.address;

    // Email must be unique
    const emailIsRegistered =
      await digitalBankingService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    // Phone number must be unique
    const phoneIsRegistered =
      await digitalBankingService.phoneIsRegistered(phone);
    if (phoneIsRegistered) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Phone number is already registered'
      );
    }

    const success = await digitalBankingService.updateAccount(
      id,
      name,
      email,
      phone,
      address
    );
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update account'
      );
    }

    return response
      .status(200)
      .json({ id: id, message: 'Update account successful' });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete account request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteAccount(request, response, next) {
  try {
    const id = request.params.id;

    const success = await digitalBankingService.deleteAccount(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete account'
      );
    }

    return response
      .status(200)
      .json({ id: id, message: 'Delete account successful' });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle change account pin request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function changePin(request, response, next) {
  try {
    // Check pin confirmation
    if (request.body.pin_new !== request.body.pin_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'PIN confirmation mismatched'
      );
    }

    // Check old pin
    if (
      !(await digitalBankingService.checkPin(
        request.params.id,
        request.body.pin_old
      ))
    ) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong Old PIN');
    }

    const changeSuccess = await digitalBankingService.changePin(
      request.params.id,
      request.body.pin_new
    );

    if (!changeSuccess) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to change PIN'
      );
    }

    return response
      .status(200)
      .json({ id: request.params.id, message: 'Change PIN successful' });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle withdraw balance request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function withdrawBalance(request, response, next) {
  try {
    const id = request.params.id;
    const pin = request.body.pin;
    const withdraw = request.body.withdraw;

    const checkPin = await digitalBankingService.checkPin(id, pin);
    if (!checkPin) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Wrong PIN for this account'
      );
    }

    // mengecek apakah saldonya cukup untuk tarik saldo
    const balance = await digitalBankingService.checkBalance(id);
    if (balance < withdraw) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to withdraw balance. Your balance is not enough for withdrawal'
      );
    }

    const success = await digitalBankingService.withdrawBalance(id, withdraw);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to withdraw balance'
      );
    }

    // untuk mengecek total saldo sekarang di rekening
    const currentBalance = await digitalBankingService.checkBalance(id);

    return response.status(200).json({
      id: id,
      balance: currentBalance,
      message: 'Withdraw Balance successful',
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle deposit balance request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function depositBalance(request, response, next) {
  try {
    const id = request.params.id;
    const pin = request.body.pin;
    const deposit = request.body.deposit;

    const checkPin = await digitalBankingService.checkPin(id, pin);
    if (!checkPin) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Wrong PIN for this account'
      );
    }

    const success = await digitalBankingService.depositBalance(id, deposit);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to deposit balance'
      );
    }

    // untuk mengecek total saldo sekarang di rekening
    const currentBalance = await digitalBankingService.checkBalance(id);

    return response.status(200).json({
      id: id,
      balance: currentBalance,
      message: 'Deposit Balance successful',
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle transfer balance request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function transferBalance(request, response, next) {
  try {
    const id = request.params.id;
    const pin = request.body.pin;
    const transfer = request.body.transfer;
    const to_id = request.body.to_id;

    const checkPin = await digitalBankingService.checkPin(id, pin);
    if (!checkPin) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Wrong PIN for this account'
      );
    }

    // mengecek apakah saldonya cukup untuk transfer saldo
    const balance = await digitalBankingService.checkBalance(id);
    if (balance < transfer) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to withdraw balance. Your balance is not enough for transaction'
      );
    }

    const success = await digitalBankingService.transferBalance(
      id,
      transfer,
      to_id
    );
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to transfer balance'
      );
    }

    // untuk mengecek total saldo sekarang di rekening
    const currentBalance = await digitalBankingService.checkBalance(id);

    return response.status(200).json({
      id: id,
      balance: currentBalance,
      message: 'Transfer Balance successful',
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get transaction history request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getHistory(request, response, next) {
  try {
    const id = request.params.id;
    const category = request.query.category; // jika tidak di isi, maka defaultnya adalah all (menampilkan semua transaksi)

    const success = await digitalBankingService.getHistory(id, category);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to get transaction history'
      );
    }
    return response.status(200).json(success);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  changePin,
  withdrawBalance,
  depositBalance,
  transferBalance,
  getHistory,
};
