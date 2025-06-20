const express = require('express');
const router = express.Router();
const {
    createCRN,
    getAllCRNs,
    getCRN,
    updateCRN,
    deleteCRN,
    addStudent,
    addSupervisor
} = require('../controllers/crnController');

router.route('/')
    .post(createCRN)
    .get(getAllCRNs);

router.route('/:id')
    .get(getCRN)
    .put(updateCRN)
    .delete(deleteCRN);

router.route('/:id/students')
    .post(addStudent);

router.route('/:id/supervisors')
    .post(addSupervisor);

module.exports = router; 