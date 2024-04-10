const express = require('express');
const router = express.Router();
const { requiresAuth } = require('express-openid-connect');


// Routes
router.use('/', require('./swagger') /*  #swagger.ignore = true */);

// Require authentication for all routes past this point
router.use(requiresAuth());

// Galaxies
router.use('/galaxies', require('./galaxies') /*  #swagger.tags = ['Galaxies']  */);

// Users
router.use('/users', require('./users') /*  #swagger.tags = ['Users']  */);

// Planets
router.use('/planets', require('./planets') /*  #swagger.tags = ['Planets']  */);

// Missions
router.use('/missions', require('./missions') /*  #swagger.tags = ['Missions']  */);


module.exports = router;
