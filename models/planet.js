const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fleetSchema = require('./fleetSchema'); // Import the fleet subschema
const resourcesSchema = require('./resourcesSchema'); // Import the resources subschema

const planetSchema = new Schema({
    lastUpdated: {
        type: Date,
        default: Date.now
    },

    basicInfo: [{
        owner: ObjectId,
        planetName: String,
        coordinates: [{
            systemIndex: Number,
            planetIndex: Number,
        }],
    }],

    inboundMissions: [{
        type: ObjectId,
        ref: 'Mission'
    }],

    outboundMissions: [{
        type: ObjectId,
        ref: 'Mission'
    }],

    debrisField: [resourcesSchema],

    fleet: [fleetSchema],

    resources: [resourcesSchema],

    buildings: [{
        metalMine: {
            type: Number,
            required: true
        },
        crystalMine: {
            type: Number,
            required: true
        },
        deuteriumSynthesizer: {
            type: Number,
            required: true
        },
        solarPlant: {
            type: Number,
            required: true
        },
        fusionReactor: {
            type: Number,
            required: true
        },
        metalStorage: {
            type: Number,
            required: true
        },
        crystalStorage: {
            type: Number,
            required: true
        },
        deuteriumTank: {
            type: Number,
            required: true
        },
        shipyard: {
            type: Number,
            required: true
        },
    }]
});

const Planet = model("Planet", planetSchema);

module.exports = Planet;
