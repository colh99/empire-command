const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    ownedPlanets: [{
        type: Schema.Types.ObjectId,
        ref: 'Planet'
    }],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
