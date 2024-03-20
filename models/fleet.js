const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fleetSchema = new Schema({
    battleCruiser: {
        type: Number,
        required: true
    },
    smallCargo: {
        type: Number,
        required: true
    },
    largeCargo: {
        type: Number,
        required: true
    },
    recycler: {
        type: Number,
        required: true
    },
    espionageProbe: {
        type: Number,
        required: true
    },
});

const Fleet = mongoose.model('Fleet', fleetSchema);

module.exports = Fleet;
