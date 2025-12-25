const { pool } = require("../config/db");
const logger = require("../utils/logger");

const getAllExercises = async () => {
  const query = `
    SELECT *
    FROM exercises
    ORDER BY name;
  `;

  const { rows } = await pool.query(query);
  return rows;
};

const getExercisesByPrimaryMuscles = async (muscles) => {
  const query = `
    SELECT *
    FROM exercises
    WHERE primary_muscles && $1
    ORDER BY name;
  `;

  const values = [muscles];
  const { rows } = await pool.query(query, values);
  return rows;
};

module.exports = {
  getAllExercises,
  getExercisesByPrimaryMuscles,
};
