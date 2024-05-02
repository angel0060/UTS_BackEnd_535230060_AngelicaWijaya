const { User } = require('../../../models');

/**
 * Get a list of users
 * @param {string} search - Search
 * @param {string} sort - Sort
 * @param {number} page_number - Page Number
 * @param {number} page_size - Page Size
 * @returns {Promise}
 */
async function getUsers(search, sort, page_number, page_size) {
  // search di split
  const searchh = search.split(':');
  const searchFor = searchh[1];

  // sort di split
  sort = sort.split(':');
  const sortBy = {};
  sortBy[sort[0]] = sort[1]; // menentukan sort berdasarkan kategori apa dan dengan urutan apa

  let users = 0; // inisialisasi variabel

  // membuat kondisi if yang sesuai untuk filter data
  if (searchh[0] == 'name') {
    // jika mencari berdasarkan filter name:
    users = User.find({
      name: { $regex: searchFor },
    })
      .sort(sortBy)
      .skip(page_number * page_size)
      .limit(page_size);
  } else if (searchh[0] == 'email') {
    // jika mencari berdasarkan filter email:
    users = User.find({
      email: { $regex: searchFor },
    })
      .sort(sortBy)
      .skip(page_number * page_size)
      .limit(page_size);
  } else {
    // jika tidak memakai filter
    users = User.find({})
      .sort(sortBy)
      .skip(page_number * page_size)
      .limit(page_size);
  }
  return users;
}

/**
 * Count Users
 * @param {string} search - Search
 * @returns {Promise}
 */
async function countUsers(search) {
  // search di split
  const searchh = search.split(':');
  const searchFor = searchh[1];

  let count = 0; // inisialisasi variabel

  // membuat kondisi if yang sesuai untuk filter data
  if (searchh[0] == 'name') {
    // jika menghitung data dengan filter name:
    count = User.countDocuments({
      name: { $regex: searchFor },
    });
  } else if (searchh[0] == 'email') {
    // jika menghitung data dengan filter email:
    count = User.countDocuments({
      email: { $regex: searchFor },
    });
  } else {
    // jika tidak memakai filter
    count = User.countDocuments({});
  }
  return count;
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getUser(id) {
  return User.findById(id);
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Hashed password
 * @returns {Promise}
 */
async function createUser(name, email, password) {
  return User.create({
    name,
    email,
    password,
  });
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {Promise}
 */
async function updateUser(id, name, email) {
  return User.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        email,
      },
    }
  );
}

/**
 * Delete a user
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function deleteUser(id) {
  return User.deleteOne({ _id: id });
}

/**
 * Get user by email to prevent duplicate email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

/**
 * Update user password
 * @param {string} id - User ID
 * @param {string} password - New hashed password
 * @returns {Promise}
 */
async function changePassword(id, password) {
  return User.updateOne({ _id: id }, { $set: { password } });
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  changePassword,
  countUsers,
};
