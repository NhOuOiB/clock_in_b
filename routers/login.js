const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const mssql = require('mssql');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
  try {
    console.log('login');
    let connection = await pool.connect();
    const request = new mssql.Request(connection);
    request.input('account', mssql.VarChar, req.body.account);
    request.input('password', mssql.VarChar, req.body.password);
    request.input('individual_id', mssql.VarChar, req.body.individual_id);

    let permission_check = await request.query('SELECT permission FROM account WHERE account = @account');

    let find_individual_case = await request.query('SELECT ic.individual_id FROM individual_case ic WHERE individual_id = @individual_id AND enable = 1');
    let individual_data = find_individual_case.recordset;

    console.log(permission_check.recordset[0]);

    if (permission_check.recordset[0]?.permission === 2) {
      if (individual_data.length == 0) {
        return res.status(401).json({ message: '個案代號錯誤' });
      }
    }

    let individual = individual_data[0];

    let result = await request.query(
      'SELECT a.id, e.employee_id, e.name, a.permission FROM account a Left JOIN employee e ON a.employee_id = e.employee_id  WHERE account = @account AND password = @password AND e.enable = 1',
    );
    let users = result.recordset;

    if (users.length == 0) {
      return res.status(401).json({ message: '帳號或密碼錯誤' });
    }

    let user = users[0];

    let payload = {
      id: user.employee_id,
      name: user.name,
      individual_id: individual?.individual_id,
      permission: user.permission,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3d' });
    res.cookie('token', token, {
      // domain: '192.168.1.108:8000',
      // path: '/',
      // httpOnly: true, // 防止 XSS 攻擊
      // sameSite: 'none',
      // secure: true, // 只有在 HTTPS 連線時才可以發送 cookie
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 天
    });

    res.json({ message: '成功登入', permission: user.permission, id: user.employee_id, name: user.name, individual_id: individual?.individual_id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

mssql.on('error', (err) => {
  console.log(err + 'from mssql.on');
  res.status(500).json({ message: '伺服器錯誤' });
});

module.exports = router;
