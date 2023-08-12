const db = require('../database');

/// Users
/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return db
    .query(`SELECT * FROM users  WHERE email = $1`, [email])
    .then((result) => {
      if (result.rows.length === 0) {
        return null; // No user found with the provided email
      } else {
        return result.rows[0]; // Return the user object
      }
    })
    .catch((err) => {
      console.log(err.message);
    });
};

module.exports = getUserWithEmail;