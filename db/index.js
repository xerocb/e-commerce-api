const pg = require('pg');
const { Pool } = pg;

const pool = new Pool({
    user: process.env.DBUSER,
    host: process.env.DBHOST,
    database: process.env.DBDATABASE,
    password: process.env.DBPASSWORD,
    port: process.env.DBPORT
});

const query = (text, params, callback) => {
    return pool.query(text, params, callback);
};

module.exports = query;