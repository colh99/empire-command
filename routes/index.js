const express = require('express');
const router = express.Router();

// Routes
router.use('/', require('./swagger') /*  #swagger.ignore = true */);

// Galaxies
router.use('/galaxies', require('./galaxies') /*  #swagger.tags = ['Galaxies']  */);

// Users
router.use('/users', require('./users') /*  #swagger.tags = ['Users']  */);

// Planets
router.use('/planets', require('./planets') /*  #swagger.tags = ['Planets']  */);

// Missions
router.use('/missions', require('./missions') /*  #swagger.tags = ['Missions']  */);


module.exports = router;
