const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const resourcesSchema = new Schema({
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
});

const Resources = model("Resources", resourcesSchema);

module.exports = Resources;