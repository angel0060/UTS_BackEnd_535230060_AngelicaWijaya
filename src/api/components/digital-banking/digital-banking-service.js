const digitalBankingRepository = require('./digital-banking-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');
const { generateToken } = require('../../../utils/session-token');

/**
 * Check account email and pin for login.
 * @param {string} ip - IP address
 * @param {string} email - Email
 * @param {string} pin - PIN
 * @returns {object} An object containing, among others, the JWT token if the email and pin are matched. Otherwise returns null.
 */
async function checkLoginCredentials(ip, email, pin) {
  const account = await digitalBankingRepository.getAccountByEmail(email);

  // We define default account pin here as '<RANDOM_PASSWORD_FILTER>'
  // to handle the case when the account login is invalid. We still want to
  // check the pin anyway, so that it prevents the attacker in
  // guessing login credentials by looking at the processing time.
  const accountPin = account ? account.pin : '<RANDOM_PIN_FILLER>';
  const pinChecked = await passwordMatched(pin, accountPin);

  // Because we always check the pin (see above comment), we define the
  // login attempt as successful when the `account` is found (by email) and
  // the pin matches.
  if (account && pinChecked) {
    // jika login berhasil, attempt di hapus
    await digitalBankingRepository.deleteAttempt(ip);

    // inisialisasi tanggal untuk message
    const currentDateTime = new Date().toLocaleString();
    return {
      email: account.email,
      name: account.name,
      user_id: account.id,
      token: generateToken(account.email, account.id),
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

  if (!checkTime) {
    const time = new Date().toLocaleString();
    // jika tidak ada, maka membuat time out baru
    await digitalBankingRepository.createTimeOut(ip, time);
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
      await digitalBankingRepository.deleteAttempt(ip);

      // menghapus time out di database
      await digitalBankingRepository.deleteTimeOut(ip);

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
    const success = await digitalBankingRepository.saveAttempt(ip, attempts);
    if (success == true) {
      return true;
    }
  } else {
    // jika attempt yg kedua dan seterusnya, maka meng-update attempt di database
    const success = await digitalBankingRepository.updateAttempt(ip, attempts);
    return true;
  }
}

/**
 * Checking time out
 * @param {string} ip - IP address
 * @returns {Promise}
 */
async function checkingTimeOut(ip) {
  const timeOut = await digitalBankingRepository.checkTimeOut(ip);
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
  const attemptt = await digitalBankingRepository.getAttempt(ip);
  if (!attemptt) {
    return null;
  }
  return attemptt.attempt;
}

/**
 * Get list of accounts
 * @param {string} search - Search
 * @param {string} sort - Sort
 * @param {number} page_number - Page Number
 * @param {number} page_size - Page Size
 * @returns {Array}
 */
async function getAccounts(search, sort, page_number, page_size) {
  // Mencari data accounts yang akan di tampilkan
  const accounts = await digitalBankingRepository.getAccounts(
    search,
    sort,
    page_number,
    page_size
  );

  // Menghitung count
  const count = await digitalBankingRepository.countAccounts(search);

  // menghitung total pages
  let total_pages = 1;
  if (count > page_size && (count / page_size) % 2 == 0) {
    total_pages = Math.trunc(count / page_size);
  } else if (count > page_size) {
    total_pages = Math.trunc(count / page_size) + 1;
  }

  // menentukan apakah ada halaman sebelumnya
  let has_previous_page = true;
  if (page_number == 0) {
    has_previous_page = false;
  }

  // menentukan apakah ada halaman berikutnya
  let has_next_page = true;
  if (page_number + 1 == total_pages) {
    has_next_page = false;
  }

  // array berisi data accounts
  const results = [];
  for (let i = 0; i < accounts.length; i += 1) {
    const account = accounts[i];
    results.push({
      id: account.id,
      id_number: account.id_number,
      name: account.name,
      email: account.email,
      phone: account.phone,
      birth_place: account.birth_place,
      birth_date: account.birth_date.toLocaleDateString(),
      address: account.address,
      pin: account.pin,
      balance: account.balance,
    });
  }

  // response yang akan dihasilkan
  const res = {
    page_number: page_number + 1,
    page_size: page_size,
    count: count,
    total_pages: total_pages,
    has_previous_page: has_previous_page,
    has_next_page: has_next_page,
    data: results,
  };

  return res;
}

/**
 * Get account detail
 * @param {string} id - Account ID
 * @returns {Object}
 */
async function getAccount(id) {
  const account = await digitalBankingRepository.getAccount(id);

  // Account not found
  if (!account) {
    return null;
  }

  return {
    id: account.id,
    id_number: account.id_number,
    name: account.name,
    email: account.email,
    phone: account.phone,
    birth_place: account.birth_place,
    birth_date: account.birth_date.toLocaleDateString(),
    address: account.address,
    pin: account.pin,
    balance: account.balance,
  };
}

/**
 * Create new account
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} phone - Phone Number
 * @param {string} pin - PIN
 * @returns {boolean}
 */
async function createAccount(
  id_number,
  name,
  email,
  phone,
  birth_place,
  birth_date,
  address,
  pin
) {
  // Hash pin
  const hashedPin = await hashPassword(pin);

  // inisialisasi saldo awal
  const balance = 0;

  try {
    await digitalBankingRepository.createAccount(
      id_number,
      name,
      email,
      phone,
      birth_place,
      birth_date,
      address,
      hashedPin,
      balance
    );
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing account
 * @param {string} id - Account ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} phone - Phone Number
 * @param {string} address - Address
 * @returns {boolean}
 */
async function updateAccount(id, name, email, phone, address) {
  const account = await digitalBankingRepository.getAccount(id);

  // Account not found
  if (!account) {
    return null;
  }

  try {
    await digitalBankingRepository.updateAccount(
      id,
      name,
      email,
      phone,
      address
    );
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete account
 * @param {string} id - Account ID
 * @returns {boolean}
 */
async function deleteAccount(id) {
  const account = await digitalBankingRepository.getAccount(id);

  // Account not found
  if (!account) {
    return null;
  }

  try {
    await digitalBankingRepository.deleteAccount(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check whether the id_number is registered
 * @param {string} id_number - Identity Number
 * @returns {boolean}
 */
async function idNumberIsRegistered(id_number) {
  const account =
    await digitalBankingRepository.getAccountByIdNumber(id_number);

  if (account) {
    return true;
  }

  return false;
}

/**
 * Check whether the email is registered
 * @param {string} email - Email
 * @returns {boolean}
 */
async function emailIsRegistered(email) {
  const account = await digitalBankingRepository.getAccountByEmail(email);

  if (account) {
    return true;
  }

  return false;
}

/**
 * Check whether the phone is registered
 * @param {string} phone - Phone Number
 * @returns {boolean}
 */
async function phoneIsRegistered(phone) {
  const account = await digitalBankingRepository.getAccountByPhone(phone);

  if (account) {
    return true;
  }

  return false;
}

/**
 * Check whether the pin is correct
 * @param {string} accountId - Account ID
 * @param {string} pin - PIN
 * @returns {boolean}
 */
async function checkPin(accountId, pin) {
  const account = await digitalBankingRepository.getAccount(accountId);
  return passwordMatched(pin, account.pin);
}

/**
 * Change account pin
 * @param {string} accountId - Account ID
 * @param {string} pin - PIN
 * @returns {boolean}
 */
async function changePin(accountId, pin) {
  const account = await digitalBankingRepository.getAccount(accountId);

  // Check if account not found
  if (!account) {
    return null;
  }

  const hashedPin = await hashPassword(pin);

  const changeSuccess = await digitalBankingRepository.changePin(
    accountId,
    hashedPin
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

/**
 * Withdraw balance
 * @param {string} accountId - Account ID
 * @param {number} withdraw - Withdraw
 * @returns {boolean}
 */
async function withdrawBalance(accountId, withdraw) {
  const account = await digitalBankingRepository.getAccount(accountId);

  // Check if account not found
  if (!account) {
    return null;
  }

  // inisialisasi variabel untuk mengurangi saldo
  const balance = account.balance - withdraw;

  const success = await digitalBankingRepository.changeBalance(
    accountId,
    balance
  );
  if (!success) {
    return null;
  }

  return true;
}

/**
 * Deposit balance
 * @param {string} accountId - Account ID
 * @param {number} deposit - Deposit
 * @returns {boolean}
 */
async function depositBalance(accountId, deposit) {
  const account = await digitalBankingRepository.getAccount(accountId);

  // Check if account not found
  if (!account) {
    return null;
  }

  // inisialisasi variabel untuk menambah saldo
  const balance = account.balance + deposit;

  const success = await digitalBankingRepository.changeBalance(
    accountId,
    balance
  );
  if (!success) {
    return null;
  }

  return true;
}

/**
 * Transfer balance
 * @param {string} accountId - Account ID
 * @param {number} transfer - Transfer
 * @param {string} receiverId - Receiver Account ID
 * @returns {boolean}
 */
async function transferBalance(accountId, transfer, receiverId) {
  // mengambil data account yang akan transfer saldo
  const account = await digitalBankingRepository.getAccount(accountId);

  // Check if account not found
  if (!account) {
    return null;
  }

  // inisialisasi variabel untuk mengurangi saldo pengirim
  const subtractBalance = account.balance - transfer;

  const substractSuccess = await digitalBankingRepository.changeBalance(
    accountId,
    subtractBalance
  );
  if (!substractSuccess) {
    return null;
  }

  // mengambil data account yang akan menerima transfer saldo
  const receiver = await digitalBankingRepository.getAccount(receiverId);

  // Check if receiver account not found
  if (!receiver) {
    return null;
  }

  // inisialisasi variabel untuk menambah saldo penerima
  const addBalance = receiver.balance + transfer;

  const addSuccess = await digitalBankingRepository.changeBalance(
    receiverId,
    addBalance
  );
  if (!addSuccess) {
    return null;
  }

  return true;
}

/**
 * Check balance
 * @param {string} id - Account ID
 * @returns {Promise}
 */
async function checkBalance(id) {
  const account = await digitalBankingRepository.getAccount(id);
  return account.balance;
}

module.exports = {
  checkLoginCredentials,
  checkingTimeOut,
  checkTimeOut,
  loginFailed,
  getAttempt,
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  idNumberIsRegistered,
  emailIsRegistered,
  phoneIsRegistered,
  checkPin,
  changePin,
  withdrawBalance,
  depositBalance,
  transferBalance,
  checkBalance,
};
