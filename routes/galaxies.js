const express = require('express');
const router = express.Router();
// const { requiresAuth } = require('express-openid-connect');

const controller = require('../controllers/galaxies');


// Route to get a galaxy's array of rules by ID
router.get('/:id/rules', controller.getGalaxyRulesById, (req, res) => {
    /*
    #swagger.summary = 'Get the rules of a galaxy by ID.'
    */
});

// Route to get a galaxy's array of all users by ID
router.get('/:id/users', controller.getGalaxyUsersById, (req, res) => {
    /*
    #swagger.summary = 'Get the array of all users in a galaxy by ID.
    */
});

// Route to get a galaxy's array of all systems by ID
router.get('/:id/systems', controller.getGalaxySystemsById, (req, res) => {
    /*
    #swagger.summary = 'Get the array of all systems in a galaxy by ID.'
    */
});

// Route to get a system in the galaxy by galaxy ID and system number
router.get('/:id/:systemNumber', controller.getGalaxySystemBySystem, (req, res) => {
    /*
    #swagger.summary = 'Get a system in the galaxy by galaxy ID and system number.'
    */
});

// Route to create a new galaxy
router.post('/', controller.createGalaxy, (req, res) => {
    /*
    #swagger.summary = 'Create a new galaxy.'
        #swagger.parameters['body'] = {
        in: 'body',
        schema: {
            $ref: '#/definitions/Galaxy',
        }
    }
    */
});

// Route to update a galaxy's rules by ID
router.put('/:id/rules', controller.updateGalaxyRulesById, (req, res) => {
    /*
    #swagger.summary = 'Update galaxy rules by ID.'
        #swagger.parameters['body'] = {
        in: 'body',
        schema: {
            $ref: '#/definitions/Rules',
        }
    }
    */
});

// Route to delete a galaxy
router.delete('/:id', controller.deleteGalaxy, (req, res) => {
    /*
    #swagger.summary = 'Delete a galaxy by ID.'
    */
});


module.exports = router;