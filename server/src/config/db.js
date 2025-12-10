import mysql from 'mysql2/promise';

// Create the connection pool. The pool-specific settings are the defaults
const dbPool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'mancingku_dev',
  password: '',
});

// try {
//   // For pool initialization, see above
//   const [rows, fields] = await pool.query('SELECT * FROM users');
//   console.log(rows);
//   // Connection is automatically released when query resolves
// } catch (err) {
//   console.log(err);
// }

export default dbPool;
