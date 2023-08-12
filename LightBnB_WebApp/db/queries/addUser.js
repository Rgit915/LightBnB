const db = require('../database'); 


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  const { name, email, password } = user;

  return db.query(
    `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *`,
    [name, email, password]
  )
    .then((result) => {
      return result.rows[0]; // Return the inserted user object
    })
    .catch((err) => {
      console.log(err.message);
    });
};

module.exports = addUser;