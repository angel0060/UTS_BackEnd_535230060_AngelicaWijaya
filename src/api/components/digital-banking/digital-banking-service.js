const digitalBankingRepository = require('./digital-banking-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');

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
  const account = await digitalBankingRepository.getUserByIdNumber(id_number);

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
  const account = await digitalBankingRepository.getUserByEmail(email);

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
  const account = await digitalBankingRepository.getUserByPhone(phone);

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
