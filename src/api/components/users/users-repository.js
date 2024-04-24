const { split } = require('lodash');
const { User } = require('../../../models');

/**
 * Get a list of users
 * @returns {Promise}
 */
async function getUsers(search, sort, page_number, page_size) {
  // search & sort di split
  const searchh = search.split(':');
  const searchFor = searchh[1];

  sort = sort.split(':');
  const sortBy = {};
  sortBy[sort[0]] = sort[1];

  if (searchh[0] == 'name') {
    const users = User.find({
      name: { $regex: searchFor, $options: 'i' },
    })
      .sort(sortBy)
      .skip(page_number * page_size)
      .limit(page_size);
    return users;
  } else if (searchh[0] == 'email') {
    const users = User.find({
      email: { $regex: searchFor, $options: 'i' },
    })
      .sort(sortBy)
      .skip(page_number * page_size)
      .limit(page_size);
    return users;
  } else {
    const users = User.find({})
      .sort(sortBy)
      .skip(page_number * page_size)
      .limit(page_size);
    return users;
  }
}

async function countUsers(search) {
  const searchh = search.split(':');
  const searchFor = searchh[1];

  if (searchh[0] == 'name') {
    const count = User.countDocuments({
      name: { $regex: searchFor, $options: 'i' },
    });
    return count;
  } else if (searchh[0] == 'email') {
    const count = User.countDocuments({
      email: { $regex: searchFor, $options: 'i' },
    });
    return count;
  } else {
    const count = User.countDocuments({});
    return count;
  }
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
