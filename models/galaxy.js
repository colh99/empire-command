const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const systemSchema = new Schema({
    systemNumber: { type: Number, required: true },
    orbits: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Planet', 
        default: null 
    }],
});


const galaxySchema = new Schema({
    galaxyNumber: {
        type: Number,
        required: true
    },
    galaxyName: {
        type: String,
        required: true
    },
    rulesConfig: [{
        GAME_OVERALL_SPEED: { // Modifies everything. All other speeds are relative to this
            type: Number,
            required: true,
            default: 1
        },
        TRAVEL_SPEED: {
            type: Number,
            required: true,
            default: 1
        },
        MINING_SPEED: {
            type: Number,
            required: true,
            default: 1
        },
        BUILDING_SPEED: {
            type: Number,
            required: true,
            default: 1
        }
    }],
    systems: [systemSchema],
    users: {
        type: Array,
        required: true
    }
});

const Galaxy = mongoose.model('Galaxy', galaxySchema);

module.exports = Galaxy;
