const sql = require('mssql');
require('dotenv').config();

const sqlConfig = {
  user: 'sa',
  password: '123456',
  database: 'dulieu',
  server: 'DESKTOP-6ICFLK0\\SQLEXPRESS',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};
const poolPromise = new sql.ConnectionPool(sqlConfig)
  .connect()
  .then(pool => {
    console.log('Kết nối SQL Server thành công');
    return pool;
  })
  .catch(err => {
    console.error('Lỗi kết nối SQL Server', err);
    throw err; // Ném lại lỗi để middleware xử lý
  });

module.exports = {
  sql,
  poolPromise,
};
