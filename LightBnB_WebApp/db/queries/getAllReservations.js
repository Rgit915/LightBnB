/// Reservations
const db = require('../database'); 

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  const query = `
    SELECT
      reservations.id,
      properties.title,
      properties.number_of_bathrooms,
      properties.number_of_bedrooms,
      properties.parking_spaces,
      properties.cost_per_night,
      reservations.start_date,
      AVG(property_reviews.rating) AS average_rating
    FROM
      reservations
      JOIN properties ON reservations.property_id = properties.id
      JOIN property_reviews ON properties.id = property_reviews.property_id
    WHERE
      reservations.guest_id = $1
    GROUP BY
      properties.id,
      reservations.id
    ORDER BY
      reservations.start_date
    LIMIT $2;
  `;

  return db.query(query, [guest_id, limit])
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
     });
};

module.exports = getAllReservations;