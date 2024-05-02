const { Account } = require('../../../models');

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
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} phone - Phone Number
 * @param {string} pin - Hashed pin
 * @param {number} balance - Balance
 * @returns {Promise}
 */
async function createAccount(name, email, phone, pin, balance) {
  return Account.create({
    name,
    email,
    phone,
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
 * @returns {Promise}
 */
async function updateAccount(id, name, email, phone) {
  return Account.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        email,
        phone,
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
 * Get account by email to prevent duplicate email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return Account.findOne({ email });
}

/**
 * Get account by phone number to prevent duplicate phone number
 * @param {string} phone - Phone Number
 * @returns {Promise}
 */
async function getUserByPhone(phone) {
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

module.exports = {
  getAccounts,
  countAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  getUserByEmail,
  getUserByPhone,
  changePin,
  changeBalance,
};
