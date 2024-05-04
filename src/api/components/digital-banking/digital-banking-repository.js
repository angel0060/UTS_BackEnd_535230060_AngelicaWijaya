const {
  Account,
  bankTime,
  bankLogin,
  Transaction,
} = require('../../../models');

/**
 * Create time out
 * @param {string} ip - IP address
 * @param {date} time - bankTime
 * @returns {Promise}
 */
async function createTimeOut(ip, time) {
  return bankTime.create({
    ip,
    time,
  });
}

/**
 * Check time out
 * @param {string} ip - IP address
 * @returns {Promise}
 */
async function checkTimeOut(ip) {
  return bankTime.findOne({ ip });
}

/**
 * Delete time out
 * @param {string} ip - IP address
 * @returns {Promise}
 */
async function deleteTimeOut(ip) {
  return bankTime.deleteOne({ ip: ip });
}

/**
 * Save Attempt
 * @param {string} ip - IP address
 * @param {number} attempts - Attempts
 * @returns {Promise}
 */
async function saveAttempt(ip, attempt) {
  bankLogin.create({
    ip,
    attempt,
  });
  return true;
}

/**
 * Update Attempt
 * @param {string} ip - IP address
 * @param {number} attempts - Attempts
 * @returns {Promise}
 */
async function updateAttempt(ip, attempt) {
  return bankLogin.updateOne(
    {
      ip: ip,
    },
    {
      $set: {
        attempt,
      },
    }
  );
}

/**
 * Get Attempt
 * @param {string} ip - IP address
 * @returns {Promise}
 */
async function getAttempt(ip) {
  return bankLogin.findOne({ ip });
}

/**
 * Delete Attempt
 * @param {string} ip - IP address
 * @returns {Promise}
 */
async function deleteAttempt(ip) {
  return bankLogin.deleteOne({ ip: ip });
}

/**
 * Get a list of accounts
 * @param {string} search - Search
 * @param {string} sort - Sort
 * @param {number} page_number - Page Number
 * @param {number} page_size - Page Size
 * @returns {Promise}
 */
async function getAccounts(search, sort, page_number, page_size) {
  // search di split
  const searchh = search.split(':');
  const searchFor = searchh[1];

  // sort di split
  sort = sort.split(':');
  const sortBy = {};
  sortBy[sort[0]] = sort[1]; // menentukan sort berdasarkan kategori apa dan dengan urutan apa

  let accounts = 0; // inisialisasi variabel

  // membuat kondisi if yang sesuai untuk filter data
  if (searchh[0] == 'name') {
    // jika mencari berdasarkan filter name:
    accounts = Account.find({
      name: { $regex: searchFor },
    })
      .sort(sortBy)
      .skip(page_number * page_size)
      .limit(page_size);
  } else if (searchh[0] == 'email') {
    // jika mencari berdasarkan filter email:
    accounts = Account.find({
      email: { $regex: searchFor },
    })
      .sort(sortBy)
      .skip(page_number * page_size)
      .limit(page_size);
  } else if (searchh[0] == 'phone') {
    // jika mencari berdasarkan filter phone:
    accounts = Account.find({
      phone: { $regex: searchFor },
    })
      .sort(sortBy)
      .skip(page_number * page_size)
      .limit(page_size);
  } else {
    // jika tidak memakai filter
    accounts = Account.find({})
      .sort(sortBy)
      .skip(page_number * page_size)
      .limit(page_size);
  }
  return accounts;
}

/**
 * Count Accounts
 * @param {string} search - Search
 * @returns {Promise}
 */
async function countAccounts(search) {
  // search di split
  const searchh = search.split(':');
  const searchFor = searchh[1];

  let count = 0; // inisialisasi variabel

  // membuat kondisi if yang sesuai untuk filter data
  if (searchh[0] == 'name') {
    // jika menghitung data dengan filter name:
    count = Account.countDocuments({
      name: { $regex: searchFor },
    });
  } else if (searchh[0] == 'email') {
    // jika menghitung data dengan filter email:
    count = Account.countDocuments({
      email: { $regex: searchFor },
    });
  } else if (searchh[0] == 'phone') {
    // jika menghitung data dengan filter phone:
    count = Account.countDocuments({
      phone: { $regex: searchFor },
    });
  } else {
    // jika tidak memakai filter
    count = Account.countDocuments({});
  }
  return count;
}

/**
 * Get account detail
 * @param {string} id - Account ID
 * @returns {Promise}
 */
async function getAccount(id) {
  return Account.findById(id);
}

/**
 * Create new account
 * @param {string} id_number - National ID Number
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} phone - Phone Number
 * @param {string} birth_place - Birth place
 * @param {date} birth_date - Birth Date
 * @param {string} address - Address
 * @param {string} pin - Hashed PIN
 * @param {number} balance - Balance
 * @returns {Promise}
 */
async function createAccount(
  id_number,
  name,
  email,
  phone,
  birth_place,
  birth_date,
  address,
  pin,
  balance
) {
  return Account.create({
    id_number,
    name,
    email,
    phone,
    birth_place,
    birth_date,
    address,
    pin,
    balance,
  });
}

/**
 * Update existing account
 * @param {string} id - Account ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} phone - Phone Number
 * @param {string} address - Address
 * @returns {Promise}
 */
async function updateAccount(id, name, email, phone, address) {
  return Account.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        email,
        phone,
        address,
      },
    }
  );
}

/**
 * Delete a account
 * @param {string} id - Account ID
 * @returns {Promise}
 */
async function deleteAccount(id) {
  return Account.deleteOne({ _id: id });
}

/**
 * Get account by id_number to prevent duplicate id_number
 * @param {string} id_number - Identity Number
 * @returns {Promise}
 */
async function getAccountByIdNumber(id_number) {
  return Account.findOne({ id_number });
}

/**
 * Get account by email to prevent duplicate email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getAccountByEmail(email) {
  return Account.findOne({ email });
}

/**
 * Get account by phone number to prevent duplicate phone number
 * @param {string} phone - Phone Number
 * @returns {Promise}
 */
async function getAccountByPhone(phone) {
  return Account.findOne({ phone });
}

/**
 * Update account pin
 * @param {string} id - Account ID
 * @param {string} pin - New hashed pin
 * @returns {Promise}
 */
async function changePin(id, pin) {
  return Account.updateOne({ _id: id }, { $set: { pin } });
}

/**
 * Change balance
 * @param {string} id - Account ID
 * @param {number} balance - Balance
 * @returns {Promise}
 */
async function changeBalance(id, balance) {
  return Account.updateOne({ _id: id }, { $set: { balance } });
}

/**
 * Create transaction history
 * @param {string} id - Account ID
 * @param {date} date_time - Date & Time of transaction
 * @param {string} type - Transaction type
 * @param {number} total - Total
 * @returns {Promise}
 */
async function createTransaction(account_id, date_time, type, total) {
  return Transaction.create({
    account_id,
    date_time,
    type,
    total,
  });
}

/**
 * Find transaction history
 * @param {string} id - Account ID
 * @param {string} category - Transaction category
 * @returns {Promise}
 */
async function findTransaction(account_id, category) {
  let transaction = 0;

  if (category == 'all') {
    transaction = Transaction.find({ account_id });
  } else {
    transaction = Transaction.find({ account_id, type: category });
  }
  return transaction;
}

module.exports = {
  createTimeOut,
  checkTimeOut,
  deleteTimeOut,
  saveAttempt,
  updateAttempt,
  getAttempt,
  deleteAttempt,
  getAccounts,
  countAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountByIdNumber,
  getAccountByEmail,
  getAccountByPhone,
  changePin,
  changeBalance,
  createTransaction,
  findTransaction,
};
