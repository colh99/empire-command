const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    galaxiesJoined: [{
        type: Schema.Types.ObjectId,
        ref: 'Galaxy'
    }],
    planetsOwned: [{
        type: Schema.Types.ObjectId,
        ref: 'Planet'
    }],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
