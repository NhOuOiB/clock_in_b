const hrModel = require('../models/hr');
const moment = require('moment');

async function getCheckRecord(req, res) {
  let data = await hrModel.getCheckRecord();
  res.json(data);
}

async function addCheckRecord(req, res) {
  let { id, type, lat, lng } = req.body;
  let now = moment().format('YYYY-MM-DD HH:mm:ss');
  await hrModel.addCheckRecord(id, type, now, lat, lng);
  res.json('成功');
}

async function addEmployee(req, res) {
  let { account, password, permission, name, salary } = req.body;
  await hrModel.addEmployee(account, password, permission, name, salary);
  res.json('成功');
}

module.exports = {
  getCheckRecord,
  addCheckRecord,
  addEmployee
};
