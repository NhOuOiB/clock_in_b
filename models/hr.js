const pool = require('../utils/db');
const mssql = require('mssql');
const moment = require('moment');

async function getClockRecord(settlement_id, settlement_type, begin, end, individual_id, individual_name, employee_name, page, pageSize) {
  try {
    console.log('getClockRecord');
    let connection = await pool.connect();
    const request = new mssql.Request(connection);
    const { DateTime, Int } = mssql;

    // 創建查詢條件
    const conditions = [];
    const parameters = [];

    parameters.push({ name: 'pageSize', type: mssql.Int, value: pageSize });
    parameters.push({ name: 'page', type: mssql.Int, value: (page - 1) * pageSize });

    if (settlement_id !== '') {
      conditions.push('ic.settlement_id = @settlement_id');
      parameters.push({ name: 'settlement_id', type: Int, value: settlement_id });
    }

    if (begin !== '') {
      if (settlement_type == 1) {
        conditions.push(`FORMAT(cr.in_time, 'yyyy-MM-dd HH:mm') >= @begin`);
      } else if (settlement_type == 2) {
        conditions.push(`FORMAT(cr.out_time, 'yyyy-MM-dd HH:mm') >= @begin`);
      }
      parameters.push({ name: 'begin', type: DateTime, value: begin });
    }

    if (end !== '') {
      if (settlement_type == 1) {
        conditions.push(`FORMAT(cr.in_time, 'yyyy-MM-dd HH:mm') <= @end`);
      } else if (settlement_type == 2) {
        conditions.push(`FORMAT(cr.out_time, 'yyyy-MM-dd HH:mm') <= @end`);
      }
      parameters.push({ name: 'end', type: DateTime, value: end });
    }

    if (individual_id !== '') {
      conditions.push("ic.individual_id LIKE '%' + @individual_id + '%'");
      parameters.push({ name: 'individual_id', type: mssql.VarChar, value: individual_id });
    }

    if (individual_name !== '') {
      conditions.push("ic.individual_name LIKE '%' + @individual_name + '%'");
      parameters.push({ name: 'individual_name', type: mssql.VarChar, value: individual_name });
    }

    if (employee_name !== '') {
      conditions.push("e.name LIKE '%' + @employee_name + '%'");
      parameters.push({ name: 'employee_name', type: mssql.VarChar, value: employee_name });
    }

    parameters.forEach((param) => request.input(param.name, param.type, param.value));

    const countSqlQuery = `SELECT 
    ic.individual_id, 
    ic.individual_name, 
    ic.morning_wage, 
    ic.afternoon_wage, 
    ic.night_wage,
    t.type_name,
    e.name, 
    cr.id, 
    cr.in_lat_lng, 
    cr.out_lat_lng, 
    cr.in_time, 
    cr.out_time 
  FROM 
    clock_record cr 
    INNER JOIN employee e ON cr.employee_id = e.employee_id 
    INNER JOIN individual_case ic ON cr.individual_id = ic.individual_id
    INNER JOIN type t ON ic.type_id = t.type_id
    WHERE cr.enable = 1 AND cr.out_time IS NOT NULL ${conditions.length > 0 ? 'AND ' + conditions.join(' AND ') : ''}
  ORDER BY cr.in_time DESC
  `;

    // 構建 SQL 查詢
    const sqlQuery = `
  SELECT 
    ic.individual_id, 
    ic.individual_name, 
    ic.morning_wage, 
    ic.afternoon_wage, 
    ic.night_wage,
    t.type_name,
    e.name, 
    cr.id, 
    cr.in_lat_lng, 
    cr.out_lat_lng, 
    cr.in_time, 
    cr.out_time 
  FROM 
    clock_record cr 
    INNER JOIN employee e ON cr.employee_id = e.employee_id 
    INNER JOIN individual_case ic ON cr.individual_id = ic.individual_id
    INNER JOIN type t ON ic.type_id = t.type_id
    WHERE cr.enable = 1 ${conditions.length > 0 ? 'AND ' + conditions.join(' AND ') : ''}
  ORDER BY cr.in_time DESC OFFSET @page ROWS FETCH NEXT @pageSize ROWS ONLY`;

    // 執行查詢
    const res = await request.query(sqlQuery);
    const countRes = await request.query(countSqlQuery);

    return { totalData: countRes.recordset, data: res.recordset };
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

async function getClockRecordById(id) {
  try {
    console.log('getClockRecordById');
    let connection = await pool.connect();
    const request = new mssql.Request(connection);

    request.input('id', mssql.Int, id);

    const sqlQuery = `
    SELECT 
    cr.in_time, 
    cr.out_time 
    FROM 
    clock_record cr 
    WHERE cr.id = @id
    ORDER BY cr.in_time DESC`;

    // 執行查詢
    const res = await request.query(sqlQuery);

    return res.recordset;
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

async function getClockRecordByEmployee(individual_id, page, pageSize) {
  try {
    console.log('getClockRecordByEmployee');
    let connection = await pool.connect();
    const request = new mssql.Request(connection);
    const twoMonthsAgo = moment().subtract(2, 'month').format('YYYY-MM-DD HH:mm:ss');

    request.input('individual_id', mssql.VarChar, individual_id);
    request.input('pageSize', mssql.Int, pageSize);
    request.input('page', mssql.Int, (page - 1) * pageSize);
    request.input('twoMonthsAgo', mssql.DateTime, twoMonthsAgo);

    const sqlQueryAllData = `
    SELECT 
    ic.individual_id, 
    ic.individual_name, 
    ic.morning_wage, 
    ic.afternoon_wage, 
    ic.night_wage,
    t.type_name,
    e.name, 
    cr.id, 
    cr.in_lat_lng, 
    cr.out_lat_lng, 
    cr.in_time, 
    cr.out_time 
  FROM 
    clock_record cr 
    INNER JOIN employee e ON cr.employee_id = e.employee_id 
    INNER JOIN individual_case ic ON cr.individual_id = ic.individual_id
    INNER JOIN type t ON ic.type_id = t.type_id
    WHERE cr.enable = 1 AND cr.individual_id = @individual_id AND cr.in_time > @twoMonthsAgo
  ORDER BY cr.in_time DESC`;

    const sqlQuery = `
    SELECT 
    ic.individual_id, 
    ic.individual_name, 
    ic.morning_wage, 
    ic.afternoon_wage, 
    ic.night_wage,
    t.type_name,
    e.name, 
    cr.id, 
    cr.in_lat_lng, 
    cr.out_lat_lng, 
    cr.in_time, 
    cr.out_time 
  FROM 
    clock_record cr 
    INNER JOIN employee e ON cr.employee_id = e.employee_id 
    INNER JOIN individual_case ic ON cr.individual_id = ic.individual_id
    INNER JOIN type t ON ic.type_id = t.type_id
    WHERE cr.enable = 1 AND cr.individual_id = @individual_id AND cr.in_time > @twoMonthsAgo
  ORDER BY cr.in_time DESC OFFSET @page ROWS FETCH NEXT @pageSize ROWS ONLY`;

    // 執行查詢
    const resAllData = await request.query(sqlQueryAllData);
    const res = await request.query(sqlQuery);

    return { totalData: resAllData.recordset, data: res.recordset };
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

async function addClockRecord(id, individual_id, type, lat, lng) {
  const connection = await pool.connect();

  try {
    console.log('addClockRecord')
    console.log(`employee_id : ${id} individual_id : ${individual_id} type : ${type}`)
    const request = new mssql.Request(connection);
    const now = new Date();

    request.input('employee_id', mssql.Int, id);
    request.input('individual_id', mssql.VarChar, individual_id);
    request.input('now', mssql.DateTime, now);
    request.input('latlng', mssql.VarChar, `${lat}, ${lng}`);
    request.input('action', mssql.VarChar, type);

    // 確保個案代號有在資料庫
    let find_individual_case = await request.query('SELECT ic.individual_id FROM individual_case ic WHERE individual_id = @individual_id AND enable = 1');
    let individual_data = find_individual_case.recordset;
    if (individual_data.length === 0) {
      return { status: false, message: '個案代號錯誤，請重新登入' };
    }

    let already_clock_in = await request.query(
      'SELECT TOP 1 id, in_time, out_time FROM clock_record WHERE employee_id = @employee_id AND individual_id = @individual_id ORDER BY id DESC',
    );

    if (type === '上班') {
      if (already_clock_in.recordset.length === 0 || already_clock_in.recordset[0].out_time !== null) {
        // 插入新的打卡記錄
        await request.query('INSERT INTO clock_record (employee_id, individual_id, in_time, in_lat_lng, enable) VALUES (@employee_id, @individual_id, @now, @latlng, 1)');

        // 打卡動作紀錄
        await request.query(`INSERT INTO clock_record_history (employee_id, individual_id, action) VALUES (@employee_id, @individual_id, @action)`);
        return { status: true, message: '打卡成功' };
      } else {
        return { status: false, message: '上次打卡紀錄還沒有下班' };
      }
    } else if (type === '下班') {
      if (already_clock_in.recordset.length !== 0 && already_clock_in.recordset[0].out_time === null) {
        request.input('id', mssql.Int, already_clock_in.recordset[0].id);
        await request.query('UPDATE clock_record SET out_time = @now, out_lat_lng = @latlng WHERE id = @id');

        // 打卡動作紀錄
        await request.query(`INSERT INTO clock_record_history (employee_id, individual_id, action) VALUES (@employee_id, @individual_id, @action)`);
        return { status: true, message: '打卡成功' };
      } else {
        return { status: false, message: '沒有上班紀錄不能打下班卡' };
      }
    } else {
      return {status: false, message: '來源錯誤'}
    }
  } catch (error) {
    const request = new mssql.Request(connection);
    // 確保動作紀錄
    request.input('employee_id', mssql.Int, id);
    request.input('individual_id', mssql.VarChar, individual_id);
    request.input('action', mssql.VarChar, type);
    request.input('error', mssql.VarChar, error.message);
    await request.query(`INSERT INTO clock_record_history (employee_id, individual_id, action, error) VALUES (@employee_id, @individual_id, @action, @error)`);
    return { message: `伺服器錯誤，${error.message}` };
  } finally {
    connection.release();
  }
}

async function makeUpClockIn(id, individual_id, in_time, out_time) {
  try {
    console.log('makeUpClockIn');
    let connection = await pool.connect();
    const request = new mssql.Request(connection);

    request.input('employee_id', mssql.Int, id);
    request.input('individual_id', mssql.VarChar, individual_id);
    request.input('in_time', mssql.DateTime, in_time);
    if (out_time != '') {
      request.input('out_time', mssql.DateTime, out_time);
    }

    let already_clock_in = await request.query(
      "SELECT id FROM clock_record WHERE employee_id = @employee_id AND individual_id = @individual_id AND in_time >= DATEADD(DAY, DATEDIFF(DAY, 0, @in_time), -1) + '23:00' AND in_time < DATEADD(DAY, DATEDIFF(DAY, 0, @in_time), 0) + '23:00'",
    );
    if (out_time == '') {
      if (already_clock_in.recordset.length === 0) {
        // clock record not exist, insert a new record
        const res = await request.query('INSERT INTO clock_record (employee_id, individual_id, in_time, enable) VALUES (@employee_id, @individual_id, @in_time, 1)');

        if (res.rowsAffected[0] !== 1) {
          return { status: false, message: '打卡失敗' };
        } else {
          return { status: true, message: '打卡成功' };
        }
      } else {
        // clock record exist

        return { status: false, message: '已經有打卡紀錄了' };
      }
    } else {
      const insert = await request.query(
        'INSERT INTO clock_record (employee_id, individual_id, in_time, out_time, enable) VALUES (@employee_id, @individual_id, @in_time, @out_time, 1)',
      );
      if (insert.rowsAffected[0] !== 1) {
        return { status: false, message: '打卡失敗' };
      } else {
        return { status: true, message: '打卡成功' };
      }
    }
  } catch (error) {
    console.log(error);
    return { status: false, message: '伺服器錯誤' };
  }
}

async function updateClockRecord(id, in_time, out_time) {
  try {
    console.log('updateClockRecord');
    let connection = await pool.connect();
    const request = new mssql.Request(connection);

    request.input('id', mssql.Int, id);
    request.input('in_time', mssql.DateTime, in_time);
    request.input('out_time', mssql.DateTime, out_time != 'Invalid date' && out_time != null && out_time != '' ? out_time : null);

    update_record = await request.query('UPDATE clock_record SET in_time = @in_time, out_time = @out_time WHERE id = @id');

    if (update_record.rowsAffected[0] == 1) {
      return { status: true, message: '更新成功' };
    }
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

async function deleteClockRecord(id) {
  try {
    console.log('deleteClockRecord');
    let connection = await pool.connect();
    const request = new mssql.Request(connection);
    request.input('id', mssql.Int, id);

    let update_account = await request.query('UPDATE clock_record SET enable = 0 WHERE id = @id');

    if (update_account.rowsAffected[0] == 1) return { message: '刪除成功' };
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

async function getEmployee(employee_name, page, pageSize) {
  try {
    console.log('getEmployee');
    let connection = await pool.connect();
    const request = new mssql.Request(connection);

    let conditions = [];
    let parameters = [];

    parameters.push({ name: 'pageSize', type: mssql.Int, value: pageSize });
    parameters.push({ name: 'page', type: mssql.Int, value: (page - 1) * pageSize });

    if (employee_name !== '') {
      conditions.push("e.name LIKE '%' + @employee_name + '%'");
      parameters.push({ name: 'employee_name', type: mssql.VarChar, value: employee_name });
    }

    let countSqlQuery = `SELECT COUNT(*) AS count FROM account a INNER JOIN employee e ON a.employee_id = e.employee_id WHERE e.enable = 1 ${
      conditions.length > 0 ? 'AND ' + conditions.join(' AND ') : ''
    }`;

    let sqlQuery = `SELECT a.account, a.password, e.employee_id, e.name FROM account a INNER JOIN employee e ON a.employee_id = e.employee_id WHERE e.enable = 1 ${
      conditions.length > 0 ? 'AND ' + conditions.join(' AND ') : ''
    } ORDER BY e.name ASC OFFSET @page ROWS FETCH NEXT @pageSize ROWS ONLY`;

    parameters.forEach((param) => request.input(param.name, param.type, param.value));

    let countRes = await request.query(countSqlQuery);
    let res = await request.query(sqlQuery);

    return { count: countRes.recordset[0].count, data: res.recordset };
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

async function getEmployeeById(employee_id) {
  try {
    console.log('getEmployeeById');
    let connection = await pool.connect();
    const request = new mssql.Request(connection);

    request.input('employee_id', mssql.Int, employee_id);

    let res = await request.query(
      'SELECT a.id, a.account, a.password, e.employee_id, e.name FROM account a INNER JOIN employee e ON a.employee_id = e.employee_id WHERE a.employee_id = @employee_id AND e.enable = 1',
    );

    return res.recordset;
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

async function addEmployee(account, password, name) {
  try {
    console.log('addEmployee');
    let connection = await pool.connect();
    const request = new mssql.Request(connection);

    request.input('account', mssql.VarChar, account);
    request.input('password', mssql.VarChar, password);
    request.input('name', mssql.VarChar, name);

    // 驗證
    let acc_exsisted = await request.query('SELECT * FROM account a INNER JOIN employee e ON a.employee_id = e.employee_id  WHERE a.account = @account AND e.enable = 1');

    if (acc_exsisted.recordset.length > 0) {
      return { status: false, message: '帳號重複' };
    }

    // 新增
    let emp = await request.query('INSERT INTO employee (name) VALUES (@name)');
    let employee_id = await request.query('SELECT employee_id FROM employee WHERE name = @name');

    request.input('employee_id', mssql.Int, employee_id.recordset[employee_id.recordset.length - 1].employee_id);

    let acc = await request.query('INSERT INTO account (account, password, permission, employee_id ) VALUES (@account, @password, 2, @employee_id)');

    if (emp.rowsAffected[0] != 1) {
      return { status: false, message: '員工新增失敗' };
    }
    if (acc.rowsAffected[0] != 1) {
      return { status: false, message: '帳號新增失敗' };
    }

    return { status: true, message: '新增成功' };
  } catch (error) {
    console.log(error);
    return { status: false, message: '伺服器錯誤' };
  }
}

async function updateEmployee(id, account, password, name, employee_id) {
  try {
    console.log('updateEmployee');
    let connection = await pool.connect();
    const request = new mssql.Request(connection);
    request.input('id', mssql.Int, id);
    request.input('account', mssql.VarChar, account.trim());
    request.input('password', mssql.VarChar, password.trim());
    request.input('name', mssql.VarChar, name.trim());
    request.input('employee_id', mssql.Int, employee_id);

    // 驗證
    let acc_exsisted = await request.query('SELECT * FROM account a INNER JOIN employee e ON a.employee_id = e.employee_id  WHERE a.account = @account AND e.enable = 1');

    if (acc_exsisted.recordset[0]?.id !== id && acc_exsisted.recordset[0]?.account.trim() === account.trim()) {
      return { status: false, message: '帳號重複' };
    }

    // 更新
    let update_account = await request.query('UPDATE account SET account = @account, password = @password WHERE employee_id = @employee_id');
    let update_employee = await request.query('UPDATE employee SET name = @name WHERE employee_id = @employee_id');
    if (update_account.rowsAffected[0] == 1 && update_employee.rowsAffected[0] == 1) {
      return { status: true, message: '更新成功' };
    }
  } catch (error) {
    console.log(error);
    return { status: false, message: '伺服器錯誤' };
  }
}

async function deleteEmployee(employee_id) {
  try {
    console.log('deleteEmployee');
    let connection = await pool.connect();
    const request = new mssql.Request(connection);

    request.input('employee_id', mssql.Int, employee_id);

    let update_account = await request.query('UPDATE employee SET enable = 0 WHERE employee_id = @employee_id');

    if (update_account.rowsAffected[0] == 1) return { message: '刪除成功' };
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

async function getIndividual(individual_name, page, pageSize) {
  try {
    console.log('getIndividual');
    let connection = await pool.connect();
    const request = new mssql.Request(connection);

    let parameters = [];
    let conditions = [];

    if (individual_name !== '') {
      conditions.push("ic.individual_name LIKE '%' + @individual_name + '%'");
      parameters.push({ name: 'individual_name', type: mssql.VarChar, value: individual_name });
    }

    parameters.push({ name: 'pageSize', type: mssql.Int, value: pageSize });
    parameters.push({ name: 'page', type: mssql.Int, value: (page - 1) * pageSize });

    let countSqlQuery = `SELECT COUNT(*) AS count FROM individual_case ic INNER JOIN settlement s ON ic.settlement_id = s.settlement_id INNER JOIN type t ON ic.type_id = t.type_id WHERE ic.enable = 1 ${
      conditions.length > 0 ? 'AND ' + conditions.join(' AND') : ''
    }`;

    let sqlQuery = `SELECT ic.individual_id, ic.individual_name, s.settlement_name, t.type_name FROM individual_case ic INNER JOIN settlement s ON ic.settlement_id = s.settlement_id INNER JOIN type t ON ic.type_id = t.type_id WHERE ic.enable = 1 ${
      conditions.length > 0 ? 'AND ' + conditions.join(' AND') : ''
    } ORDER BY ic.individual_name ASC OFFSET @page ROWS FETCH NEXT @pageSize ROWS ONLY`;

    parameters.forEach((param) => request.input(param.name, param.type, param.value));

    let countRes = await request.query(countSqlQuery);
    let res = await request.query(sqlQuery);

    return { count: countRes.recordset[0].count, data: res.recordset };
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

async function getIndividualById(individual_id) {
  try {
    console.log('getIndividualById');
    let connection = await pool.connect();
    const request = new mssql.Request(connection);

    request.input('individual_id', mssql.VarChar, individual_id);

    let res = await request.query('SELECT * FROM individual_case ic WHERE ic.individual_id = @individual_id AND ic.enable = 1');

    return res.recordset;
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

async function addIndividual(individual_id, individual_name, settlement_id, type_id, morning_wage, afternoon_wage, night_wage) {
  try {
    console.log('addIndividual');
    let connection = await pool.connect();
    const request = new mssql.Request(connection);

    request.input('individual_id', mssql.VarChar, individual_id);
    request.input('individual_name', mssql.VarChar, individual_name);
    request.input('settlement_id', mssql.Int, settlement_id);
    request.input('type_id', mssql.Int, type_id);
    request.input('morning_wage', mssql.Int, morning_wage);
    request.input('afternoon_wage', mssql.Int, afternoon_wage);
    request.input('night_wage', mssql.Int, night_wage);

    let find_repeat_individual_id = await request.query('SELECT ic.individual_id FROM individual_case ic WHERE ic.individual_id = @individual_id');

    if (find_repeat_individual_id.recordset.length > 0) {
      return { status: false, message: '個案代碼重複' };
    }

    let response = await request.query(
      'INSERT INTO individual_case (individual_id, individual_name, settlement_id, type_id, morning_wage, afternoon_wage, night_wage) VALUES (@individual_id, @individual_name, @settlement_id, @type_id, @morning_wage, @afternoon_wage, @night_wage)',
    );

    return { status: true, message: '新增成功' };
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

async function updateIndividual(individual_id, individual_name, settlement_id, type_id, morning_wage, afternoon_wage, night_wage) {
  try {
    console.log('updateIndividual');
    let connection = await pool.connect();
    const request = new mssql.Request(connection);

    request.input('individual_id', mssql.VarChar, individual_id);
    request.input('individual_name', mssql.VarChar, individual_name);
    request.input('settlement_id', mssql.Int, settlement_id);
    request.input('type_id', mssql.Int, type_id);
    request.input('morning_wage', mssql.Int, morning_wage);
    request.input('afternoon_wage', mssql.Int, afternoon_wage);
    request.input('night_wage', mssql.Int, night_wage);

    let update_individual = await request.query(
      'UPDATE individual_case SET individual_name = @individual_name, settlement_id = @settlement_id, type_id = @type_id, morning_wage = @morning_wage, afternoon_wage = @afternoon_wage, night_wage = @night_wage WHERE individual_id = @individual_id',
    );
    if (update_individual.rowsAffected[0] == 1) {
      return { status: true, message: '更新成功' };
    }
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

async function deleteIndividual(individual_id) {
  try {
    console.log('deleteIndividual');
    let connection = await pool.connect();
    const request = new mssql.Request(connection);

    request.input('individual_id', mssql.VarChar, individual_id);

    let update_individual = await request.query('UPDATE individual_case SET enable = 0 WHERE individual_id = @individual_id');

    if (update_individual.rowsAffected[0] == 1) return { message: '刪除成功' };
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

async function getSpecialRecord() {
  try {
    console.log('getSpecialRecord');
    let connection = await pool.connect();
    const request = new mssql.Request(connection);

    let res = await request.query(
      'SELECT scr.id, scr.individual_id, scr.[begin], scr.[end], sc.special_case_name, sc.multiple FROM special_case_record scr INNER JOIN special_case sc ON scr.special_case_id = sc.special_case_id WHERE scr.enable = 1 ORDER BY scr.[begin] DESC',
    );

    return res.recordset;
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

async function getSpecialRecordById(id) {
  try {
    console.log('getSpecialRecordById');
    let connection = await pool.connect();
    const request = new mssql.Request(connection);

    request.input('id', mssql.Int, id);

    let res = await request.query(
      'SELECT scr.special_case_id, scr.individual_id, scr.[begin], scr.[end], sc.multiple FROM special_case_record scr INNER JOIN special_case sc ON sc.special_case_id = scr.special_case_id WHERE scr.id = @id AND scr.enable = 1',
    );

    return res.recordset;
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

async function addSpecialRecord(special_case_id, individual_id, begin, end) {
  try {
    console.log('addSpecialRecord');
    let connection = await pool.connect();
    const request = new mssql.Request(connection);

    request.input('special_case_id', mssql.Int, special_case_id);
    request.input('individual_id', mssql.VarChar, individual_id);
    request.input('begin', mssql.DateTime, begin);
    request.input('end', mssql.DateTime, end);

    let response = await request.query('INSERT INTO special_case_record (special_case_id, individual_id, [begin], [end]) VALUES (@special_case_id, @individual_id, @begin, @end)');

    return { status: true, message: '新增成功' };
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

async function updateSpecialRecord(id, special_case_id, individual_id, begin, end) {
  try {
    console.log('updateSpecialRecord');
    let connection = await pool.connect();
    const request = new mssql.Request(connection);

    request.input('id', mssql.Int, id);
    request.input('special_case_id', mssql.Int, special_case_id);
    request.input('individual_id', mssql.VarChar, individual_id);
    request.input('begin', mssql.DateTime, begin);
    request.input('end', mssql.DateTime, end);

    let update_individual = await request.query(
      'UPDATE special_case_record SET special_case_id = @special_case_id, individual_id = @individual_id, [begin] = @begin, [end] = @end WHERE id = @id',
    );
    if (update_individual.rowsAffected[0] == 1) {
      return { status: true, message: '更新成功' };
    }
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

async function deleteSpecialRecord(id) {
  try {
    console.log('deleteSpecialRecord');
    let connection = await pool.connect();
    const request = new mssql.Request(connection);

    request.input('id', mssql.Int, id);

    let update_individual = await request.query('UPDATE special_case_record SET enable = 0 WHERE id = @id');

    if (update_individual.rowsAffected[0] == 1) return { message: '刪除成功' };
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

async function getSpecialCase() {
  try {
    console.log('getSpecialCase');
    let connection = await pool.connect();
    const request = new mssql.Request(connection);

    let res = await request.query('SELECT sc.special_case_id, sc.special_case_name, sc.multiple FROM special_case sc WHERE sc.enable = 1');

    return res.recordset;
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

async function getSpecialCaseRecord(begin, end) {
  try {
    console.log('getSpecialCaseRecord');
    let connection = await pool.connect();
    const request = new mssql.Request(connection);

    const { DateTime } = mssql;

    // 創建查詢條件
    const conditions = [];
    const parameters = [];

    if (begin !== '') {
      conditions.push('scr.[begin] > @begin');
      parameters.push({ name: 'begin', type: DateTime, value: begin });
    }

    if (end !== '') {
      conditions.push('scr.[end] < @end');
      parameters.push({ name: 'end', type: DateTime, value: end });
    }

    parameters.forEach((param) => request.input(param.name, param.type, param.value));

    let res = await request.query(
      `SELECT scr.id, scr.individual_id, scr.[begin], scr.[end], sc.multiple FROM special_case_record scr INNER JOIN special_case sc ON sc.special_case_id = scr.special_case_id WHERE scr.enable = 1 ${
        conditions.length > 0 ? 'AND ' + conditions.join(' AND ') : ''
      }`,
    );

    return res.recordset;
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

async function getType() {
  try {
    console.log('getType');
    let connection = await pool.connect();
    const request = new mssql.Request(connection);

    let res = await request.query('SELECT t.type_id, t.type_name FROM type t WHERE t.enable = 1');
    return res.recordset;
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

async function getSettlement() {
  try {
    console.log('getSettlement');
    let connection = await pool.connect();
    const request = new mssql.Request(connection);

    let res = await request.query('SELECT s.settlement_id, s.settlement_name FROM settlement s WHERE s.enable = 1');
    return res.recordset;
  } catch (error) {
    console.log(error);
    return { message: '伺服器錯誤' };
  }
}

mssql.on('error', (err) => {
  console.log(err + 'from mssql.on');
  res.status(500).json({ message: '伺服器錯誤' });
});

module.exports = {
  getClockRecord,
  getClockRecordById,
  getClockRecordByEmployee,
  addClockRecord,
  makeUpClockIn,
  updateClockRecord,
  deleteClockRecord,
  getEmployee,
  getEmployeeById,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getIndividual,
  getIndividualById,
  addIndividual,
  updateIndividual,
  deleteIndividual,
  getSpecialRecord,
  getSpecialRecordById,
  addSpecialRecord,
  updateSpecialRecord,
  deleteSpecialRecord,
  getSpecialCase,
  getSpecialCaseRecord,
  getType,
  getSettlement,
};
