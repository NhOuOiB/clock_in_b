const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const mssql = require('mssql');
const jwt = require('jsonwebtoken');
require('dotenv').config();

router.post('/login', async (req, res) => {
  pool.connect(async (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: '資料庫連接錯誤' });
    }

    try {
      const request = new mssql.Request(pool);
      request.input('account', mssql.VarChar, req.body.account);
      request.input('password', mssql.VarChar, req.body.password);
      let result = await request.query(
        'SELECT a.id, e.employee_id, e.name, a.permission FROM account a Left JOIN employee e ON a.employee_id = e.employee_id  WHERE account = @account AND password = @password AND e.enable = 1',
      );
      let users = result.recordset;

      if (users.length == 0) {
        return res.status(401).json({ message: '信箱或密碼錯誤' });
      }

      let user = users[0];

      let payload = {
        id: user.id,
        name: user.name,
        permission: user.permission,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3d' });
      res.cookie('token', token, {
        // domain: '192.168.1.108:8000',
        // path: '/',
        httpOnly: true, // 防止 XSS 攻擊
        // sameSite: 'none',
        // secure: true, // 只有在 HTTPS 連線時才可以發送 cookie
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 天
      });

      res.json({ message: '成功登入', permission: user.permission, id: user.employee_id });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: '伺服器錯誤' });
    } finally {
      pool.close();
    }
  });
});

module.exports = router;
