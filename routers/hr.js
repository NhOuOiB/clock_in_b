const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hr');

router.get('/getClockRecord', hrController.getClockRecord);

router.get('/getClockRecordById/:id', hrController.getClockRecordById);

router.get('/getClockRecordByEmployee', hrController.getClockRecordByEmployee);

router.post('/addClockRecord', hrController.addClockRecord);

router.post('/makeUpClockIn', hrController.makeUpClockIn);

router.put('/updateClockRecord', hrController.updateClockRecord);

router.put('/deleteClockRecord', hrController.deleteClockRecord);

router.get('/getEmployee', hrController.getEmployee);

router.get('/getEmployeeById/:employee_id', hrController.getEmployeeById);

router.post('/addEmployee', hrController.addEmployee);

router.put('/updateEmployee', hrController.updateEmployee);

router.put('/deleteEmployee', hrController.deleteEmployee);

router.get('/getIndividual', hrController.getIndividual);

router.get('/getIndividualById/:individual_id', hrController.getIndividualById);

router.post('/addIndividual', hrController.addIndividual);

router.put('/updateIndividual', hrController.updateIndividual);

router.put('/deleteIndividual', hrController.deleteIndividual);

router.get('/getSpecialRecord', hrController.getSpecialRecord);

router.get('/getSpecialRecordById/:id', hrController.getSpecialRecordById);

router.post('/addSpecialRecord', hrController.addSpecialRecord);

router.put('/updateSpecialRecord', hrController.updateSpecialRecord);

router.put('/deleteSpecialRecord', hrController.deleteSpecialRecord);

router.get('/getSpecialCase', hrController.getSpecialCase)

router.get('/getSpecialCaseRecord', hrController.getSpecialCaseRecord)

router.get('/getType', hrController.getType);

router.get('/getSettlement', hrController.getSettlement);

module.exports = router;
