const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fleetSchema = require('./fleetSchema'); // Import the fleet subschema

const missionSchema = new Schema({
    commandingUser: {
        type: ObjectId,
        required: true
    },

    originPlanet: {
        type: ObjectId,
        required: true
    },

    targetPlanet: {
        type: ObjectId,
        required: true
    },

    departureTime: {
        type: Date,
        required: true
    },

    arrivalTime: {
        type: Date,
        required: true
    },

    returnTime: {
        type: Date,
        required: true
    },

    active: {
        type: Boolean,
        required: true
    },
    
    status: {
        type: String,
        enum: ["en route", "returning", "returning(aborted)", "completed", "destroyed"],
        required: true
    },

    missionType: {
        type: String, 
        enum: ["raid", "cargo", "transport", "espionage", "recycle"],
        required: true
    },

    fleet: [fleetSchema],

    cargo: [{
        metal: {
            type: Number,
            required: true
        },
        crystal: {
            type: Number,
            required: true
        },
        deuterium: {
            type: Number,
            required: true
        }
    }],

});

const Mission = model("Mission", missionSchema);

module.exports = Mission;
