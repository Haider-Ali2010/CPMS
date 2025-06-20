const express = require('express');
const router = express.Router();
const {
    createCourse,
    getAllCourses,
    getCourse,
    updateCourse,
    deleteCourse
} = require('../controllers/courseController');

router.route('/')
    .post(createCourse)
    .get(getAllCourses);

router.route('/:id')
    .get(getCourse)
    .put(updateCourse)
    .delete(deleteCourse);

module.exports = router; 