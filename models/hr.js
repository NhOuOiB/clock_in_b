const pool = require('../utils/db');
const mssql = require('mssql');

async function getCheckRecord() {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    let res = await request.query('SELECT cr.type, cr.time, cr.lat, cr.lng, e.name FROM check_record cr INNER JOIN employee e ON cr.employee_id = e.employee_id ORDER BY time');
    return res.recordset
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

async function addCheckRecord(id, type, now, lat, lng) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    request.input('employee_id', mssql.Int, id);
    request.input('type', mssql.VarChar, type);
    request.input('now', mssql.DateTime, now);
    request.input('lat', mssql.VarChar, `${lat}`);
    request.input('lng', mssql.VarChar, `${lng}`);
    
    let res = await request.query('INSERT INTO check_record (employee_id, time, type, lat, lng) VALUES (@employee_id, @now, @type, @lat, @lng)');

    return { message: '新增成功' };
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

module.exports = {
  getCheckRecord,
  addCheckRecord,
};
