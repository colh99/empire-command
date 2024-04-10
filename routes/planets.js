const express = require('express');
const router = express.Router();

const validate = require('../middleware/validate');
const controller = require('../controllers/planets');


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
router.post('/:galaxyId/:systemIndex/:planetIndex', validate.requiresAdmin, validate.createPlanet, controller.createPlanet, (req, res) => {
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
router.put('/:id/rename', validate.requiresPlanetOwnership, controller.renamePlanet, (req, res) => {
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
router.put('/:id/construct-building', validate.requiresPlanetOwnership, validate.constructBuilding, controller.constructBuilding, (req, res) => {
    /*
    #swagger.summary = 'Construct or upgrade a building.'
        #swagger.parameters['body'] = {
        in: 'body',
        description: 'Building Types: metalMine, crystalMine, deuteriumSynthesizer, solarPlant, fusionReactor, metalStorage, crystalStorage, deuteriumTank, shipyard.',
        schema: {
            "building": "metalMine",
        }
    }
    */
});

// Route to construct a ship on a planet
router.put('/:id/construct-ship', validate.requiresPlanetOwnership, validate.constructShip, controller.constructShip, (req, res) => {
    /*
    #swagger.summary = 'Construct a ship to be added to the planet fleet.'
        #swagger.parameters['body'] = {
        in: 'body',
        description: 'Ship Types: battleCruiser, smallCargo, largeCargo, espionageProbe, recycler',
        schema: {
            "ship": {
                "type": "smallCargo",
                "quantity": 1
            }
        }
    }
    */
});

// Route to DELETE a planet by ID
router.delete('/:id', validate.requiresAdmin, controller.deletePlanet, (req, res) => {
    /*
    #swagger.summary = 'Delete a planet by ID.'
    */
});

module.exports = router;
