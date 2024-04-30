const usersRepository = require('./users-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');

/**
 * Get list of users
 * @param {string} search - Search
 * @param {string} sort - Sort
 * @param {number} page_number - Page Number
 * @param {number} page_size - Page Size
 * @returns {Array}
 */
async function getUsers(search, sort, page_number, page_size) {
  // Mencari data users yang akan di tampilkan
  const users = await usersRepository.getUsers(
    search,
    sort,
    page_number,
    page_size
  );

  // Menghitung count
  const count = await usersRepository.countUsers(search);

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

  // array berisi data users
  const results = [];
  for (let i = 0; i < users.length; i += 1) {
    const user = users[i];
    results.push({
      id: user.id,
      name: user.name,
      email: user.email,
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
 * Get user detail
 * @param {string} id - User ID
 * @returns {Object}
 */
async function getUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {boolean}
 */
async function createUser(name, email, password) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await usersRepository.createUser(name, email, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateUser(id, name, email) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.updateUser(id, name, email);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deleteUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.deleteUser(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check whether the email is registered
 * @param {string} email - Email
 * @returns {boolean}
 */
async function emailIsRegistered(email) {
  const user = await usersRepository.getUserByEmail(email);

  if (user) {
    return true;
  }

  return false;
}

/**
 * Check whether the password is correct
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function checkPassword(userId, password) {
  const user = await usersRepository.getUser(userId);
  return passwordMatched(password, user.password);
}

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function changePassword(userId, password) {
  const user = await usersRepository.getUser(userId);

  // Check if user not found
  if (!user) {
    return null;
  }

  const hashedPassword = await hashPassword(password);

  const changeSuccess = await usersRepository.changePassword(
    userId,
    hashedPassword
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  emailIsRegistered,
  checkPassword,
  changePassword,
};
