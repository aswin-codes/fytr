const { pool } = require("../config/db");

const getExerciseCatalogVersion = async () => {
  const query = `
    SELECT value
    FROM app_metadata
    WHERE key = 'exercise_catalog_version'
    LIMIT 1;
  `;

  const { rows } = await pool.query(query);
  return rows[0]?.value || null;
};

module.exports = {
  getExerciseCatalogVersion,
};
