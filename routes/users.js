const express = require('express');
const router = express.Router();
// const { requiresAuth } = require('express-openid-connect');

const controller = require('../controllers/users');

// Route to get a user by ID
router.get('/:id', controller.getUserById, (req, res) => {
    /*
    #swagger.summary = 'Get a user by ID.'
    */
});

// Route to get a user by username
router.get('/:username', controller.getUserByUsername, (req, res) => {
    /*
    #swagger.summary = 'Get a user by username.'
    */
});

// Route to login
router.post('/login', controller.login, (req, res) => {
    /*
    #swagger.summary = 'Login a user.'
        #swagger.parameters['body'] = {
        in: 'body',
        schema: {
            $ref: '#/definitions/User',
        }
    }
    */
});

// Route to logout
router.post('/logout', controller.logout, (req, res) => {
    /*
    #swagger.summary = 'Logout a user.'
    */
});

// Route to register
router.post('/register', controller.register, (req, res) => {
    /*
    #swagger.summary = 'Register a new user.'
        #swagger.parameters['body'] = {
        in: 'body',
        schema: {
            $ref: '#/definitions/User',
        }
    }
    */
});


module.exports = router;


