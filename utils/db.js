require('dotenv').config();
const mssql = require('mssql');
const pool = new mssql.ConnectionPool({
    server: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    options: {
        trustServerCertificate: true,
    },
});

module.exports = pool;
