const express = require('express');
const router = express.Router();
const { requiresAuth } = require('express-openid-connect');
const validate = require('../middleware/validate');
const usersController = require('../controllers/users');


// Routes
router.use('/', require('./swagger') /*  #swagger.ignore = true */);

// Require authentication for all routes past this point
router.use(requiresAuth());

// Route to create a new user as the current authenticated user
router.post('/create', validate.createUser, usersController.createUser, (req, res) => {
    /*
    #swagger.summary = "Create a new user profile."
    #swagger.tags = ['Users']
    #swagger.parameters['obj'] = {
        in: 'body',
        schema: {
            nickname: 'Nickname',
        },
    }
    */
});

router.use(validate.requiresUserExists);

// Galaxies
router.use('/galaxies', require('./galaxies') /*  #swagger.tags = ['Galaxies']  */);

// Users
router.use('/users', require('./users') /*  #swagger.tags = ['Users']  */);

// Planets
router.use('/planets', require('./planets') /*  #swagger.tags = ['Planets']  */);

// Missions
router.use('/missions', require('./missions') /*  #swagger.tags = ['Missions']  */);


module.exports = router;
