const db = require('../database'); 

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  return db
    .query(`SELECT * FROM users  WHERE id = $1`, [id])
    .then((result) => {
      if (result.rows.length === 0) {
        return null; // No user found with the provided id
      } else {
        return result.rows[0]; // Return the user object
      }
    })
    .catch((err) => {
      console.log(err.message);
    });
};

module.exports = getUserWithId;