const pool = require('../utils/db');
const mssql = require('mssql');

async function getCheckRecord() {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    let res = await request.query('SELECT cr.type, cr.time, cr.lat, cr.lng, e.name FROM check_record cr INNER JOIN employee e ON cr.employee_id = e.employee_id ORDER BY time');
    return res.recordset;
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

    if (res.rowsAffected[0] != 1) {
      return { message: '新增失敗' };
    }
      return { message: '新增成功' };
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

async function addEmployee(account, password, permission, name, salary) {
  let connection = await pool.connect();
  try {
    const request = new mssql.Request(connection);

    request.input('account', mssql.VarChar, account);
    request.input('password', mssql.VarChar, password);
    request.input('permission', mssql.Int, permission);
    request.input('name', mssql.VarChar, name);
    request.input('salary', mssql.VarChar, salary);

    let emp = await request.query('INSERT INTO employee (name, salary ) VALUES (@name, @salary)');
    let employee_id = await request.query('SELECT employee_id FROM employee WHERE name = @name AND salary = @salary');

    request.input('employee_id', mssql.Int, employee_id.recordset[employee_id.recordset.length - 1].employee_id);

    let acc = await request.query('INSERT INTO account (account, password, permission, employee_id ) VALUES (@account, @password, @permission, @employee_id)');
    
    if (emp.rowsAffected[0] == 1) {
      return {message: 'emp新增失敗'}
    }
    if (acc.rowsAffected[0] == 1) {
      return {message: 'acc新增失敗'}
    }

      return { message: '新增成功' };
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

module.exports = {
  getCheckRecord,
  addCheckRecord,
  addEmployee,
};
