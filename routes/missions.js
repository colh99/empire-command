const express = require('express');
const router = express.Router();
const controller = require('../controllers/missions');

// Route to get a mission by ID
router.get('/:id', controller.getMissionById, (req, res) => {
    /*
    #swagger.summary = 'Get a mission by ID.'
    */
});

// Route to get all active missions
router.get('/', controller.getActiveMissions, (req, res) => {
    /*
    #swagger.summary = 'Get all active missions.'
    */
});

// Route to get all missions from a user by user's ID
router.get('/:user_id', controller.getActiveMissionsByUserId, (req, res) => {
    /*
    #swagger.summary = 'Get all active missions from a specific user by user ID.'
    */
});

// Route to create a new mission
router.post('/', controller.createMission, (req, res) => {
    /*
    #swagger.summary = 'Create a new mission.'
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