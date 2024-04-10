const express = require('express');
const router = express.Router();
const controller = require('../controllers/missions');

const validate = require('../middleware/validate');

// Route to get all missions from the current user
router.get('/my-missions', controller.getActiveMissionsByCurrentUser, (req, res) => {
    /*
    #swagger.summary = 'Get all active missions from the current user.'
    */
});

// Route to get all missions from a user by user's ID
router.get('/:user_id', validate.requiresAdmin, controller.getActiveMissionsByUserId, (req, res) => {
    /*
    #swagger.summary = 'Get all active missions from a specific user by user ID.'
    */
});

// Route to get a mission by ID
router.get('/:id', validate.requiresAdmin, controller.getMissionById, (req, res) => {
    /*
    #swagger.summary = 'Get a mission by ID.'
    */
});

// Route to get all active missions
router.get('/', validate.requiresAdmin, controller.getActiveMissions, (req, res) => {
    /*
    #swagger.summary = 'Get all active missions.'
    */
});

// Route to create a new mission from the origin planet's ID
router.post('/:id', validate.requiresPlanetOwnership, controller.createMission, (req, res) => {
    /*
    #swagger.summary = "Create a new mission from the origin planet's ID."
        #swagger.parameters['body'] = {
        in: 'body',
        schema: {
            $ref: '#/definitions/Mission',
        }
    }
    */
});

// Route to recall a mission by ID
router.put('/:id/recall', controller.recallMission, (req, res) => {
    /*
    #swagger.summary = 'Recall a mission to the origin planet (before it reaches the destination) by ID.'
    */
});

// Route to delete a mission by ID
router.delete('/:id', controller.deleteMission, (req, res) => {
    /*
    #swagger.summary = 'Delete a mission by ID (If still in transit, fleet and cargo will be lost!).'
    */
});

module.exports = router;