const express = require('express');
const router = express.Router();
// const { requiresAuth } = require('express-openid-connect');

const controller = require('../controllers/planets');
// const validation = require('../middleware/validate');


// Route to get a planet by coordinates
router.get('/:galaxyId/:systemIndex/:planetIndex', controller.getPlanetByCoordinates, (req, res) => {
    /*
    #swagger.summary = 'Get a planet at the given coordinates.'
    */
});

// Route to get a planet by ID
router.get('/:id', controller.getPlanetById, (req, res) => {
    /*
    #swagger.summary = 'Get a planet by ID.'
    */
});

// Route to CREATE a planet
router.post('/:galaxyId/:systemIndex/:planetIndex', controller.createPlanet, (req, res) => {
    /*
    #swagger.summary = 'Create a new planet in a given system and planet index.'
        #swagger.parameters['body'] = {
        in: 'body',
        schema: {
            $ref: '#/definitions/Planet',
        }
    }
    */
});

// Route to rename a planet
router.put('/:id/rename', controller.renamePlanet, (req, res) => {
    /*
    #swagger.summary = 'Rename the planet by ID.'
        #swagger.parameters['body'] = {
        in: 'body',
        schema: {
            planetName: 'New Name',
        }
    }
    */
});

// Route to build on a planet
router.put('/:id/construct-building', controller.constructBuilding, (req, res) => {
    /*
    #swagger.summary = 'Construct or upgrade a building.'
        #swagger.parameters['body'] = {
        in: 'body',
        schema: {
            $ref: '#/definitions/Buildings',
        }
    }
    */
});

// Route to construct a ship on a planet
router.put('/:id/construct-ship', controller.constructShip, (req, res) => {
    /*
    #swagger.summary = 'Construct a ship to be added to the planet fleet.'
        #swagger.parameters['body'] = {
        in: 'body',
        schema: {
            $ref: '#/definitions/Fleet',
        }
    }
    */
});

// Route to DELETE a planet by ID
router.delete('/:id', controller.deletePlanet, (req, res) => {
    /*
    #swagger.summary = 'Delete a planet by ID.'
    */
});

module.exports = router;
