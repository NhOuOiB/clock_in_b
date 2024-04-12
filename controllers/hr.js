const hrModel = require('../models/hr');
const moment = require('moment');

async function getClockRecord(req, res) {
  let { settlement_id, settlement_type, begin, end, individual_id } = req.query;
  let data = await hrModel.getClockRecord(settlement_id, settlement_type, begin, end, individual_id);
  res.json(data);
}

async function getClockRecordById(req, res) {
  let { id } = req.params;
  let data = await hrModel.getClockRecordById(id);
  res.json(data);
}

async function getClockRecordByEmployee(req, res) {
  let { employee_id } = req.query;
  let data = await hrModel.getClockRecordByEmployee(employee_id);
  res.json(data);
}

async function addClockRecord(req, res) {
  let { id, individual_id, type, lat, lng } = req.body;
  let result = await hrModel.addClockRecord(id, individual_id, type, lat, lng);

  res.json(result);
}

async function makeUpClockIn(req, res) {
  let { id, individual_id, in_time, out_time } = req.body;
  let result = await hrModel.makeUpClockIn(id, individual_id, in_time, out_time);

  res.json(result);
}

async function updateClockRecord(req, res) {
  let { id, in_time, out_time } = req.body;
  let response = await hrModel.updateClockRecord(id, in_time, out_time);
  res.json(response);
}

async function deleteClockRecord(req, res) {
  let { id } = req.query;
  let response = await hrModel.deleteClockRecord(id);
  res.json(response);
}

async function getEmployee(req, res) {
  let { employee_name } = req.query;
  let data = await hrModel.getEmployee(employee_name);
  res.json(data);
}

async function getEmployeeById(req, res) {
  let { employee_id } = req.params;
  let data = await hrModel.getEmployeeById(employee_id);
  res.json(data);
}

async function addEmployee(req, res) {
  let { account, password, name } = req.body;
  let response = await hrModel.addEmployee(account, password, name);
  res.json(response);
}

async function updateEmployee(req, res) {
  let { id, account, password, name, employee_id } = req.body;
  let response = await hrModel.updateEmployee(id, account, password, name, employee_id);
  res.json(response);
}

async function deleteEmployee(req, res) {
  let { employee_id } = req.query;
  let response = await hrModel.deleteEmployee(employee_id);
  res.json(response);
}

async function getIndividual(req, res) {
  let data = await hrModel.getIndividual();
  res.json(data);
}

async function getIndividualById(req, res) {
  let { individual_id } = req.params;
  let data = await hrModel.getIndividualById(individual_id);
  res.json(data);
}

async function addIndividual(req, res) {
  let { individual_id, individual_name, settlement_id, type_id, morning_wage, afternoon_wage, night_wage } = req.body;
  let response = await hrModel.addIndividual(individual_id, individual_name, settlement_id, type_id, morning_wage, afternoon_wage, night_wage);
  res.json(response);
}

async function updateIndividual(req, res) {
  let { individual_id, individual_name, settlement_id, type_id, morning_wage, afternoon_wage, night_wage } = req.body;
  let response = await hrModel.updateIndividual(individual_id, individual_name, settlement_id, type_id, morning_wage, afternoon_wage, night_wage);
  res.json(response);
}

async function deleteIndividual(req, res) {
  let { individual_id } = req.query;
  let response = await hrModel.deleteIndividual(individual_id);
  res.json(response);
}

async function getSpecialRecord(req, res) {
  let data = await hrModel.getSpecialRecord();
  res.json(data);
}

async function getSpecialRecordById(req, res) {
  let { id } = req.params;
  let data = await hrModel.getSpecialRecordById(id);
  res.json(data);
}

async function addSpecialRecord(req, res) {
  let { special_case_id, individual_id, begin, end } = req.body;
  let response = await hrModel.addSpecialRecord(special_case_id, individual_id, begin, end);
  res.json(response);
}

async function updateSpecialRecord(req, res) {
  let { id, special_case_id, individual_id, begin, end } = req.body;
  let response = await hrModel.updateSpecialRecord(id, special_case_id, individual_id, begin, end);
  res.json(response);
}

async function deleteSpecialRecord(req, res) {
  let { id } = req.query;
  let response = await hrModel.deleteSpecialRecord(id);
  res.json(response);
}

async function getSpecialCase(req, res) {
  let data = await hrModel.getSpecialCase();
  res.json(data);
}

async function getSpecialCaseRecord(req, res) {
  let { begin, end } = req.query;
  let data = await hrModel.getSpecialCaseRecord(begin, end);
  res.json(data);
}

async function getType(req, res) {
  let data = await hrModel.getType();
  res.json(data);
}

async function getSettlement(req, res) {
  let data = await hrModel.getSettlement();
  res.json(data);
}

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
